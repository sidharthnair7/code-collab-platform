package projectCP.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WorkSpaceRepository extends JpaRepository<WorkSpace, UUID> {
    Optional<WorkSpace> findByName(String name);


}
