package urbandesk.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Usuario {
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, length = 255)
    private String email;

    @Column(length = 255)
    private String password;
}
