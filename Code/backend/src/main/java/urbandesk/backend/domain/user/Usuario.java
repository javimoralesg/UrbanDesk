package urbandesk.backend.domain.user;

import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.incidence.Historial;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.*;
import java.time.LocalDateTime;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotBlank
    private String nombre;

    @NotBlank
    @Email
    @Column(unique = true)
    private String email;

    @JsonIgnore
    @NotBlank
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Rol rol;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @CreationTimestamp
    private LocalDateTime fechaCreacion;


    @JsonIgnore
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Historial> historiales = new ArrayList<>();


    public Usuario(String nombre, String email, String passwordHash) {
        if (nombre == null || nombre.isBlank()) {
            throw new DomainRuleViolation("El nombre del usuario no puede estar vacío");
        }
        if (email == null || email.isBlank()) {
            throw new DomainRuleViolation("El email del usuario no puede estar vacío");
        }
        if (passwordHash == null || passwordHash.isBlank()) {
            throw new DomainRuleViolation("La contraseña del usuario no puede estar vacía");
        }
        this.nombre = nombre;
        this.email = email;
        this.passwordHash = passwordHash;
        this.rol = Rol.CIUDADANO;
    }

    public void actualizarPassword(String nuevoPasswordHash) {
        if (nuevoPasswordHash == null || nuevoPasswordHash.isBlank()) {
            throw new DomainRuleViolation("La nueva contraseña no puede estar vacía.");
        }
        this.passwordHash = nuevoPasswordHash;
    }

    public void actualizarDatosPersonales(String nombre, String email) {
        if (nombre != null && !nombre.isBlank()) {
            this.nombre = nombre;
        }
        if (email != null && !email.isBlank()) {
            this.email = email;
        }
    }

    protected void setRol(Rol rol) {
        this.rol = rol;
    }
}