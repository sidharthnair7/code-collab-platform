package projectCP.file;

import projectCP.workspace.WorkSpaceDTO;

import java.time.LocalDateTime;

public record FileDTO(Integer id,
                      String fileName,
                      String content,
                      Integer workspaceId,
                      LocalDateTime createdDate,
                      LocalDateTime modifiedDate) {

}
