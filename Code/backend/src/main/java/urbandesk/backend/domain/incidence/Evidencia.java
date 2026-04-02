package urbandesk.backend.domain.incidence;

import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.user.Ciudadano;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Evidencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotBlank
    @Lob
    private String url;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @CreationTimestamp
    private LocalDateTime fechaCreacion;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "incidencia_id")
    private Incidencia incidencia;

    @ManyToOne
    @JoinColumn(name = "ciudadano_id", nullable = true)
    private Ciudadano ciudadano;

    public Evidencia(String url, Incidencia incidencia, Ciudadano ciudadano) {
        if (url == null || url.isBlank()) {
            throw new DomainRuleViolation("La URL de la evidencia no puede estar vacía");
        }
        if (incidencia == null) {
            throw new DomainRuleViolation("La evidencia debe estar asociada a una incidencia");
        }
        this.url = url;
        this.incidencia = incidencia;
        this.ciudadano = ciudadano;
    }

}