package urbandesk.backend.dto;

import java.time.LocalDateTime;

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
    private String ubicacion;
}