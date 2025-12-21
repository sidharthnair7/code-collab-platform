package projectCP.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkSpaceRepository extends JpaRepository<WorkSpace,Integer> {
    Optional<WorkSpace> findByName(String name);


}
