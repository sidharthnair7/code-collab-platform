package projectCP.codeeditor;


import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Code {
    private  CodeTextType codeTextType;
    private  String codeText;
    private int position;
    private int length;
    private String username;
    private long timestamp;
    private UUID fileId;
    private String clientId;
}
