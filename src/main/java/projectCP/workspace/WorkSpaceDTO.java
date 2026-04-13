package projectCP.workspace;


import projectCP.user.UserDTO;

import java.util.UUID;

public record WorkSpaceDTO(
        UUID id,
        String workSpaceName,
        UserDTO owner
) {

}
