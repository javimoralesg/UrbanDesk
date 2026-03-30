package urbandesk.backend.domain.incidence;

import urbandesk.backend.domain.DomainRuleViolation;
import org.hibernate.annotations.CreationTimestamp;
import urbandesk.backend.domain.user.Usuario;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Historial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private Estado estadoNuevo;

    @NotBlank
    private String observaciones;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @CreationTimestamp
    private LocalDateTime fechaCambio;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "incidencia_id")
    private Incidencia incidencia;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;


    public Historial(Incidencia incidencia, Usuario usuario, Estado estadoNuevo, String observaciones) {
        if (incidencia == null) {
            throw new DomainRuleViolation("La incidencia no puede ser nula");
        }
        if (estadoNuevo == null) {
            throw new DomainRuleViolation("El nuevo estado no puede ser nulo");
        }
        if (observaciones == null || observaciones.isBlank()) {
            throw new DomainRuleViolation("Las observaciones del historial no pueden estar vacías");
        }
        this.incidencia = incidencia;
        this.usuario = usuario;
        this.estadoNuevo = estadoNuevo;
        this.observaciones = observaciones;
    }
}