package projectCP.file;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import projectCP.user.User;
import projectCP.user.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;
    private final UserRepository userRepository;


    @GetMapping("/{id}")
    public ResponseEntity<FileDTO> getFile(@PathVariable Integer id) {
        return ResponseEntity.ok(fileService.findFileByID(id));
    }


    @GetMapping
    public ResponseEntity<List<FileDTO>> getAllFiles() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(fileService.findAll(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Void> createFile(@RequestBody CreateFileRequest request) {
        fileService.save(request.fileName(), request.workspaceId());
        return ResponseEntity.status(HttpStatus.CREATED).build();

    }

    @DeleteMapping("/{Id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Integer Id) {
        fileService.deleteFile(Id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/rename")
    public ResponseEntity<Void> rename(@PathVariable Integer id,
                                       @RequestBody RenameRequest request) {
        fileService.rename(id, request.getNewName());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/content")
    public ResponseEntity<Void> updateContent(@PathVariable Integer id,@RequestBody UpdateContentRequest request) {
        fileService.updateContent(id, request.getNewContent());
        return ResponseEntity.ok().build();
    }
}