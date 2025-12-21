package projectCP.workspace;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import projectCP.user.User;
import projectCP.user.UserDTO;
import projectCP.user.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkSpaceService {

    private final WorkSpaceRepository repository;
    private final UserRepository userRepository;



    public List<WorkSpaceDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(workSpace -> new WorkSpaceDTO(workSpace.getId(), workSpace.getName(), new UserDTO(
                        workSpace.getOwner().getId(),
                        workSpace.getOwner().getEmail(),
                        workSpace.getOwner().getFirstName(),
                        workSpace.getOwner().getLastName()
                )))
                .collect(Collectors.toList());
    }

    public void createWorkSpace(WorkSpaceDTO workSpaceDTO) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        WorkSpace workSpace = new WorkSpace(workSpaceDTO.workSpaceName(),
                user);
        repository.save(workSpace);
    }

    public void deleteWorkSpace(Integer id) {

        WorkSpace workSpace = repository.findById(id)
                .orElseThrow(()-> new RuntimeException("Workspace NOT FOUND"));
        repository.delete(workSpace);
    }

    public void updateWorkSpace(WorkSpaceDTO workSpaceDTO, Integer id) throws Exception {

        User user = userRepository.findById(workSpaceDTO.owner().id())
                .orElseThrow(() -> new RuntimeException("User not found"));

        WorkSpace workSpace = repository.findById(id)
                .orElseThrow(() -> new Exception("Workspace NOT FOUND"));

        workSpace.setName(workSpaceDTO.workSpaceName());
        workSpace.setOwner(user);
        repository.save(workSpace);

    }
}
