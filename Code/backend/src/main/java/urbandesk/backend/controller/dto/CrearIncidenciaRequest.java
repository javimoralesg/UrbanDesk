package urbanodesk.backend.controller.dto;

import lombok.Data;

@Data
public class CrearIncidenciaRequest {
    private String direccion;
    private Double latitud;
    private Double longitud;
    private String descripcion;
    private Long ciudadanoId;
}