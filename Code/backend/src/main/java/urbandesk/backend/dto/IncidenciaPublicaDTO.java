package urbandesk.backend.dto;

import java.time.LocalDateTime;

import java.util.List;

import urbandesk.backend.domain.incidence.Ubicacion;
import urbandesk.backend.domain.incidence.Historial;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class IncidenciaPublicaDTO {
    private Long id;
    private LocalDateTime fechaCreacion;
    private String estado;
    private String descripcion;
    private String prioridad;
    private Ubicacion ubicacion;
    private List<Historial> historiales;
}