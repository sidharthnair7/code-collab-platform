package projectCP.codeeditor;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RestController;


@Controller
public class CodeEditorController {

    private final SimpMessageSendingOperations messagingTemplate;

    public CodeEditorController(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    @MessageMapping("/code.operation")
    public void handleCodeOperation(@Payload Code code, SimpMessageHeaderAccessor headerAccessor) {


        String username = (String) headerAccessor.getSessionAttributes().get("username");
        code.setUsername(username);
        if (code.getTimestamp() == 0) {
            code.setTimestamp(System.currentTimeMillis());
        }

        messagingTemplate.convertAndSend("/topic/code/" + code.getFileId(), code);
    }
}
