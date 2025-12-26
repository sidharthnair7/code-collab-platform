package projectCP.chat;


import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {
    private String messageContent;
    private String sender;
    private ChatType chatType;


}
