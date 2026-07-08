package projectCP.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.config.SimpleBrokerRegistration;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration;
import org.springframework.web.socket.config.annotation.WebMvcStompWebSocketEndpointRegistration;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WebSocketConfigTest {

    private WebSocketConfig config;

    @Mock
    private StompEndpointRegistry registry;

    @Mock
    private StompWebSocketEndpointRegistration registration;

    @Mock
    private SimpleBrokerRegistration brokerRegistration;
    @Mock
    private MessageBrokerRegistry messageBrokerRegistry;


    @BeforeEach
    void setUp() {
        config = new WebSocketConfig();
    }


    @Test
    void registerStompEndpoints() {
        //given
        when(registry.addEndpoint("/editor")).thenReturn(registration);
        when(registration.setAllowedOriginPatterns("*")).thenReturn(registration);

        //when
        config.registerStompEndpoints(registry);

        //then
        verify(registration).setAllowedOriginPatterns("*");
        verify(registration).withSockJS();
    }

    @Test
    void shouldConfigureMessageBroker() {

        //given
        when(messageBrokerRegistry.enableSimpleBroker("/topic"))
                .thenReturn(brokerRegistration);

        //when
        config.configureMessageBroker(messageBrokerRegistry);

        //then
        verify(messageBrokerRegistry).setApplicationDestinationPrefixes("/app");
        verify(messageBrokerRegistry).enableSimpleBroker("/topic");


    }
}