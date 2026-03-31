package urbandesk.backend.domain.user;

import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.incidence.Evidencia;
import urbandesk.backend.domain.incidence.Incidencia;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.*;

@Entity
@PrimaryKeyJoinColumn(name = "usuario_id")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Ciudadano extends Usuario {

    @NotBlank
    private String codigoPostal;

    @JsonIgnore
    @OneToMany(mappedBy = "ciudadano", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Incidencia> incidencias = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "ciudadano", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Evidencia> evidencias = new ArrayList<>();


    public Ciudadano(String nombre, String email, String passwordHash, String codigoPostal) {
        super(nombre, email, passwordHash);
        if (codigoPostal == null || codigoPostal.isBlank()) {
            throw new DomainRuleViolation("El código postal del ciudadano no puede estar vacío");
        }
        this.codigoPostal = codigoPostal;
    }

    public void actualizarCodigoPostal(String codigoPostal) {
        if (codigoPostal != null && !codigoPostal.isBlank()) {
            this.codigoPostal = codigoPostal;
        }
    }
}