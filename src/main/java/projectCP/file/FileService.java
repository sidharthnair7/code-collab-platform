package projectCP.file;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projectCP.workspace.WorkSpace;
import projectCP.workspace.WorkSpaceRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileService {
    private final FileRepository repository;
    private final WorkSpaceRepository workSpaceRepository;


    public List<FileDTO> findAll(UUID ownerId) {
        return repository.findByWorkspaceOwnerId(ownerId)
                .stream()
                .map(file -> new FileDTO(
                        file.getId(),
                        file.getFileName(),
                        file.getContent(),
                        file.getWorkspace().getId(),
                        file.getCreatedDate(),
                        file.getModifiedDate()
                ))
                .toList();
    }
    public List<FileDTO> findByWorkspaceId(UUID workspaceId) {
        return repository.findByWorkspaceId(workspaceId)
                .stream()
                .map(file -> new FileDTO(
                        file.getId(),
                        file.getFileName(),
                        file.getContent(),
                        file.getWorkspace().getId(),
                        file.getCreatedDate(),
                        file.getModifiedDate()
                ))
                .toList();
    }


    public FileDTO findFileByID(UUID id) {
        File file = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));
        FileDTO fileDto =new FileDTO(
                file.getId(),
                file.getFileName(),
                file.getContent(),
                file.getWorkspace().getId(),
                file.getCreatedDate(),
                file.getModifiedDate());
        System.out.println("Returning file content: " + fileDto.content());
        return fileDto;
    }

    //CREATE
    public void save(String fileName,UUID workSpaceId) {
        WorkSpace workSpace = workSpaceRepository.findById(workSpaceId)
                        .orElseThrow(() -> new RuntimeException("Workspace not found"));

       File file = File.builder()
               .fileName(fileName)
               .workspace(workSpace)
               .createdDate(LocalDateTime.now())
               .modifiedDate(LocalDateTime.now())
               .build();
       repository.save(file);
    }


    public void rename(UUID id, String newName) {
        File file = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));
        file.setFileName(newName);
        repository.save(file);
    }




    public void updateContent(UUID fileID, String newContent) {
        File updateFile = repository.findById(fileID)
                .orElseThrow(() -> new RuntimeException("File not found"));

        updateFile.setContent(newContent);
        updateFile.setModifiedDate(LocalDateTime.now());
        System.out.println("Updating file content: " + updateFile.getContent());
        repository.save(updateFile);
    }

   public void deleteFile(UUID fileId) {
        File file = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        repository.delete(file);
   }
}
