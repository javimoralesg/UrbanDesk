package urbandesk.backend.domain.incidence;

import urbandesk.backend.domain.DomainRuleViolation;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode
public class Ubicacion {
    @NotBlank
    private String direccion;

    @NotNull
    private Double latitud;

    @NotNull
    private Double longitud;

    public Ubicacion(String direccion, Double latitud, Double longitud) {
        if (direccion == null || direccion.isBlank()) {
            throw new DomainRuleViolation("La dirección no puede estar vacía");
        } else if (latitud == null || latitud < -90.0 || latitud > 90.0) {
            throw new DomainRuleViolation("La latitud debe estar entre -90 y 90");
        } else if (longitud == null || longitud < -180.0 || longitud > 180.0) {
            throw new DomainRuleViolation("La longitud debe estar entre -180 y 180");
        }
        this.direccion = direccion;
        this.latitud = latitud;
        this.longitud = longitud;
    }
}