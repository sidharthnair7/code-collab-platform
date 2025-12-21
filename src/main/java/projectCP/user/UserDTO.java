package projectCP.user;

public record UserDTO(
        Integer id,
        String email,
        String firstName,
        String lastName
) {
}
