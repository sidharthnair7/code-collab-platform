package projectCP.file;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projectCP.workspace.WorkSpace;
import projectCP.workspace.WorkSpaceRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FileService {
    private final FileRepository repository;
    private final WorkSpaceRepository workSpaceRepository;


    public List<FileDTO> findAll() {
        return repository.findAll()
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


    public FileDTO findFileByID(Integer id) {
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
    public void save(String fileName,Integer workSpaceId) {
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


    public void rename(Integer id, String newName) {
        File file = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));
        file.setFileName(newName);
        repository.save(file);
    }




    public void updateContent(Integer fileID, String newContent) {
        File updateFile = repository.findById(fileID)
                .orElseThrow(() -> new RuntimeException("File not found"));

        updateFile.setContent(newContent);
        updateFile.setModifiedDate(LocalDateTime.now());
        System.out.println("Updating file content: " + updateFile.getContent());
        repository.save(updateFile);
    }

   public void deleteFile(Integer fileId) {
        File file = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        repository.delete(file);
   }
}
