package projectCP.file;

public record CreateFileRequest(
        String fileName,
        Integer workspaceId
) {}
