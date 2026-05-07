package urbandesk.backend.domain.tokens;

import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.user.Usuario;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Tokens {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotBlank
    @Size(max = 5000)
    @Column(length = 5000)
    private String tokenHash;

    @Enumerated(EnumType.STRING)
    private Tipo tipo;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @CreationTimestamp
    private LocalDateTime fechaCreacion;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime fechaExpiracion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnore
    private Usuario usuario;

    public Tokens(String tokenHash, Tipo tipo, LocalDateTime fechaExpiracion, Usuario usuario) {
        if (tokenHash == null || tokenHash.isBlank()) {
            throw new DomainRuleViolation("El token no puede ser nulo o vacío");
        }
        if (tipo == null) {
            throw new DomainRuleViolation("El tipo no puede ser nulo");
        }
        if (fechaExpiracion == null) {
            throw new DomainRuleViolation("La fecha de expiración no puede ser nula");
        }
        if (usuario == null) {
            throw new DomainRuleViolation("El usuario no puede ser nulo");
        }
        this.tokenHash = tokenHash;
        this.tipo = tipo;
        this.fechaExpiracion = fechaExpiracion;
        this.usuario = usuario;
    }

}