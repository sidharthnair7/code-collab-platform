package projectCP.workspace;

import projectCP.file.File;
import projectCP.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class WorkSpace {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private String name;
    @ManyToOne(fetch = FetchType.LAZY)
    private User owner;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @OneToMany(
            mappedBy = "workspace",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<File> files = new ArrayList<>();


    public WorkSpace(String name, User owner) {
        this.name = name;
        this.owner = owner;
    }
}
