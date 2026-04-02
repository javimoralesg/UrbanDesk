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
public class Operador extends Usuario {

    @NotNull
    private Integer cargaMaxima;

    @NotNull
    @Min(0)
    private Integer cargaActual;

    @JsonIgnore
    @OneToMany(mappedBy = "operador", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Incidencia> incidencias = new ArrayList<>();

    public Operador(String nombre, String email, String passwordHash) {
        super(nombre, email, passwordHash);
        this.setRol(Rol.OPERADOR);
        this.cargaMaxima = 10;
        this.cargaActual = 0;
    }

    public boolean tieneDisponibilidad() {
        return this.cargaActual < this.cargaMaxima;
    }

    public void incrementarCarga() {
        if (this.cargaActual == null)
            this.cargaActual = 0;
        if (!tieneDisponibilidad()) {
            throw new DomainRuleViolation("El operador ha alcanzado su capacidad máxima de trabajo.");
        }
        this.cargaActual++;
    }

    public void decrementarCarga() {
        if (this.cargaActual != null && this.cargaActual > 0) {
            this.cargaActual--;
        }
    }

    public void forzarCarga(int nuevaCarga) {
        if (nuevaCarga < 0 || nuevaCarga > cargaMaxima) {
            throw new DomainRuleViolation("La nueva carga debe estar entre 0 y la carga máxima.");
        }
        this.cargaActual = nuevaCarga;
    }
}
