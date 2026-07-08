package projectCP.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import projectCP.codeeditor.Code;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WebSocketEventListenerTest {
    @Mock
    private SimpMessageSendingOperations messagingTemplate;

    @Mock
    private StompHeaderAccessor accessor;
    @InjectMocks
    private WebSocketEventListener webSocketEventListener;

    @Test
    void handleCodeEditorOperations_shouldBroadcastCodeUpdate() {
        //given
        String username= "testUsername";
        UUID file_Id= UUID.randomUUID();

        Map<String,Object> sessionAttributes = new HashMap<>();
        sessionAttributes.put("username",username);
        when(accessor.getSessionAttributes()).thenReturn(sessionAttributes);

        Code code = new Code();
        code.setFileId(file_Id);
        //when
        webSocketEventListener.HandleCodeEditorOperations(code, accessor);

       //then
        assertThat(code.getUsername()).isEqualTo(username);
        assertThat(code.getTimestamp()).isGreaterThan(0);

        verify(messagingTemplate).convertAndSend("/topic/code/" + file_Id,code);



    }
}