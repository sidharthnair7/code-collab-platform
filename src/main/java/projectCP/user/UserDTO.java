package projectCP.user;

import java.util.UUID;

public record UserDTO(
        UUID id,
        String email,
        String firstName,
        String lastName
) {
}
