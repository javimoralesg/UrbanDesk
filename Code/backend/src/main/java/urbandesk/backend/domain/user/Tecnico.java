package urbandesk.backend.domain.user;

import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.incidence.Incidencia;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Tecnico extends Usuario {

    @NotNull
    private Integer cargaMaxima;

    @NotNull
    @Min(0)
    private Integer cargaActual;

    @Enumerated(EnumType.STRING)
    private Especialidad especialidad;

    @JsonIgnore
    @ManyToMany(mappedBy = "tecnicos")
    private Set<Incidencia> incidencias = new HashSet<>();

    public Tecnico(String nombre, String email, String passwordHash, Especialidad especialidad) {
        super(nombre, email, passwordHash);
        if (especialidad == null) {
            throw new DomainRuleViolation("La especialidad del técnico no puede ser nula");
        }
        this.setRol(Rol.TECNICO);
        this.cargaMaxima = 6;
        this.cargaActual = 0;
        this.especialidad = especialidad;
    }

    public boolean tieneDisponibilidad() {
        return this.cargaActual < this.cargaMaxima;
    }

    public void incrementarCarga() {
        if (this.cargaActual == null)
            this.cargaActual = 0;
        if (!tieneDisponibilidad()) {
            throw new DomainRuleViolation("El técnico ha alcanzado su capacidad máxima de trabajo.");
        }
        this.cargaActual++;
    }

    public void decrementarCarga() {
        if (this.cargaActual != null && this.cargaActual > 0) {
            this.cargaActual--;
        }
    }
}