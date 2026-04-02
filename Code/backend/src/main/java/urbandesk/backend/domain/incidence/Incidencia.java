package urbandesk.backend.domain.incidence;

import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.user.Ciudadano;
import urbandesk.backend.domain.user.Operador;
import urbandesk.backend.domain.user.Tecnico;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.*;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Incidencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @Embedded
    private Ubicacion ubicacion;

    @NotBlank
    @Size(max = 5000)
    @Column(length = 5000)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    @Enumerated(EnumType.STRING)
    private Prioridad prioridad;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @CreationTimestamp
    private LocalDateTime fechaCreacion;


    @OneToMany(mappedBy = "incidencia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Evidencia> evidencias = new ArrayList<>();

    @OneToMany(mappedBy = "incidencia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Historial> historiales = new ArrayList<>();


    @ManyToOne
    @JoinColumn(name = "ciudadano_id", nullable = true)
    private Ciudadano ciudadano;

    @ManyToOne
    @JoinColumn(name = "operador_id")
    private Operador operador;

    @ManyToMany
    @JoinTable(
        name = "incidencia_tecnico",
        joinColumns = @JoinColumn(name = "incidencia_id"),
        inverseJoinColumns = @JoinColumn(name = "tecnico_id")
    )
    private Set<Tecnico> tecnicos = new HashSet<>();

    @ElementCollection
    @CollectionTable(
        name = "incidencia_tecnicos_finalizados",
        joinColumns = @JoinColumn(name = "incidencia_id")
    )
    @Column(name = "tecnico_id")
    private Set<Long> tecnicosFinalizadosIds = new HashSet<>();

    public Incidencia(Ubicacion ubicacion, String descripcion, Ciudadano ciudadano) {
        if (ubicacion == null) {
            throw new DomainRuleViolation("La ubicación no puede ser nula");
        }
        if (descripcion == null || descripcion.isBlank()) {
            throw new DomainRuleViolation("La descripción no puede ser nula o vacía");
        }
        this.ubicacion = ubicacion;
        this.descripcion = descripcion;
        this.prioridad = Prioridad.SIN_ASIGNAR;
        this.ciudadano = ciudadano;
        this.estado = Estado.CREADA;
    }

    public void asignarOperador(Operador operador) {
        this.operador = operador;
    }

    public void actualizarEstado(Estado nuevoEstado) {
        this.estado = nuevoEstado;
    }

    public void agregarTecnico(Tecnico tecnico) {
        this.tecnicos.add(tecnico);
    }
    
    public void eliminarTecnico(Tecnico tecnico) {
        this.tecnicos.remove(tecnico);
    }

    public void marcarTecnicoFinalizado(Long tecnicoId) {
        this.tecnicosFinalizadosIds.add(tecnicoId);
    }

    public void asignarPrioridad(Prioridad prioridad) {
        this.prioridad = prioridad;
    }

    public void agregarHistorial(Historial historial) {
        if (historial == null) {
            throw new DomainRuleViolation("El historial no puede ser nulo");
        }
        this.historiales.add(historial);
    }

    public void agregarEvidencia(Evidencia evidencia) {
        if (evidencia == null) {
            throw new DomainRuleViolation("La evidencia no puede ser nula");
        }
        this.evidencias.add(evidencia);
    }

    public void limpiarTecnicos() {
        this.tecnicos.clear();
        this.tecnicosFinalizadosIds.clear();
    }

    public void modificarIncidencia(Ubicacion nuevaUbicacion, String nuevaDescripcion) {
        if (ubicacion == null) {
            throw new DomainRuleViolation("La ubicación no puede ser nula");
        }
        if (descripcion == null || descripcion.isBlank()) {
            throw new DomainRuleViolation("La descripción no puede ser nula o vacía");
        }
        this.ubicacion = nuevaUbicacion;
        this.descripcion = nuevaDescripcion;
        
    }
}