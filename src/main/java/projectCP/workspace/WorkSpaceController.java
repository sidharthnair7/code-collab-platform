package projectCP.workspace;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workspace")
@RequiredArgsConstructor
public class WorkSpaceController {
    private final WorkSpaceService service;


    @GetMapping
    public List<WorkSpaceDTO>  getAllWorkSpaces()
    {
        return service.findAll();
    }

    @PostMapping
    public ResponseEntity<Void> createWorkSpace(@RequestBody WorkSpaceDTO workSpaceDTO) {
        service.createWorkSpace(workSpaceDTO);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkSpace( @PathVariable Integer id) {
        service.deleteWorkSpace(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateWorkSpace(@RequestBody WorkSpaceDTO workSpaceDTO,@PathVariable Integer id) throws Exception {
        service.updateWorkSpace(workSpaceDTO,id);
        return ResponseEntity.ok().build();

    }
}
