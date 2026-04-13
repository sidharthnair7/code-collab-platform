package projectCP.file;

import projectCP.workspace.WorkSpaceDTO;

import java.time.LocalDateTime;
import java.util.UUID;

public record FileDTO(UUID id,
                      String fileName,
                      String content,
                      UUID workspaceId,
                      LocalDateTime createdDate,
                      LocalDateTime modifiedDate) {

}
