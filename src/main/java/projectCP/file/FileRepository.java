package projectCP.file;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FileRepository extends JpaRepository<File, UUID> {
    List<File> findByWorkspaceOwnerId(UUID ownerId);
    List<File> findByWorkspaceId(UUID workspaceId);

}
