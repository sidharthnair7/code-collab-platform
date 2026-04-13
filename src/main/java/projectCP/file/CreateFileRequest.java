package projectCP.file;

import java.util.UUID;

public record CreateFileRequest(
        String fileName,
        UUID workspaceId
) {}
