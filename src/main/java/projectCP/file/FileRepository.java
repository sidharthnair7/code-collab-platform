package projectCP.file;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FileRepository extends JpaRepository<File,Integer> {
    List<File> findByWorkspaceOwnerId(Integer ownerId);

}
