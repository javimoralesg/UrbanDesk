package urbandesk.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import urbandesk.backend.domain.*;
import urbandesk.backend.service.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;


@RestController
@RequestMapping("/api/incidencias")
public class IncidenciaController {
    private final IncidenciaService incidenciaService;

    public IncidenciaController(IncidenciaService incidenciaService) {
        this.incidenciaService = incidenciaService;
    }

    @GetMapping
    public ResponseEntity<List<Incidencia>> obtenerTodas() {
        return ResponseEntity.ok(incidenciaService.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incidencia> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(incidenciaService.obtenerPorId(id));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Incidencia>> obtenerPorEstado(@PathVariable Estado estado) {
        return ResponseEntity.ok(incidenciaService.obtenerPorEstado(estado));
    }

    @GetMapping("/ciudadano/{idCiudadano}")
    public ResponseEntity<List<Incidencia>> obtenerPorCiudadano(@PathVariable Long idCiudadano) {
        return ResponseEntity.ok(incidenciaService.obtenerPorCiudadano(idCiudadano));
    }

    @PostMapping
    public ResponseEntity<Incidencia> crearIncidencia(@RequestBody Incidencia incidencia) {
        return ResponseEntity.ok(incidenciaService.crearIncidencia(incidencia));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Incidencia> actualizarIncidencia(
            @PathVariable Long id,
            @RequestBody Incidencia incidenciaActualizada) {
        return ResponseEntity.ok(incidenciaService.actualizarIncidencia(id, incidenciaActualizada));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Incidencia> cambiarEstado(
            @PathVariable Long id,
            @RequestParam Estado nuevoEstado) {
        return ResponseEntity.ok(incidenciaService.cambiarEstado(id, nuevoEstado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarIncidencia(@PathVariable Long id) {
        incidenciaService.eliminarIncidencia(id);
        return ResponseEntity.noContent().build();
    }
}
    
}
