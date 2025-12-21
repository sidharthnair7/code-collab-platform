package projectCP.workspace;


import projectCP.user.UserDTO;

public record WorkSpaceDTO(
        Integer id,
        String workSpaceName,
        UserDTO owner
) {

}
