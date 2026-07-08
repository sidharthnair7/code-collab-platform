package projectCP.config;

import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import projectCP.user.UserRepository;

import java.io.IOException;
import java.net.http.HttpRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;



@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {
   @Mock
    private UserDetailsService userDetailsService;

   @Mock
    private UserRepository userRepository;
   @Mock
    private UserDetails userDetails;
   @Mock
   private JwtService jwtService;
   @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

   @AfterEach
   void tearDown() {
       SecurityContextHolder.clearContext();
   }

   @Test
    void shouldBeAuthenticatedByValidToken() throws IOException, InterruptedException, ServletException {
       //given
       MockHttpServletRequest request = new MockHttpServletRequest();
       MockHttpServletResponse response = new MockHttpServletResponse();
       MockFilterChain chain = new MockFilterChain();

       String token = "valid-token";
       String email= "testEmail@gmail.com";

       request.addHeader("Authorization", "Bearer " + token);

       //when
       when(jwtService.extractUserEmail(token)).thenReturn(email);
       when(userDetailsService.loadUserByUsername(email)).thenReturn(userDetails);
       when(jwtService.isTokenValid(token,userDetails)).thenReturn(true);


       //then

       jwtAuthenticationFilter.doFilterInternal(request,response,chain);

       assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();


   }

    @Test
    void shouldNotAuthenticateWithEmptyToken() throws IOException, InterruptedException, ServletException {
        //given
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        String token = "";
        String email= "testEmail@gmail.com";

        request.addHeader("Authorization", "Bearer " + token);

        //when
        when(jwtService.extractUserEmail(token)).thenReturn(email);
        when(userDetailsService.loadUserByUsername(email)).thenReturn(userDetails);
        when(jwtService.isTokenValid(token,userDetails)).thenReturn(false);


        //then

        jwtAuthenticationFilter.doFilterInternal(request,response,chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();


    }

    @Test
    void shouldBeAuthenticatedByNullToken() throws IOException, InterruptedException, ServletException {
        //given
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        String token = null;


        //when
        //then

        jwtAuthenticationFilter.doFilterInternal(request,response,chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();


    }


}