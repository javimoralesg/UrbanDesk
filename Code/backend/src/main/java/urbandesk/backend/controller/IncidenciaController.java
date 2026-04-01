package urbandesk.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import urbandesk.backend.controller.dto.ActualizarIncidenciaRequest;
import urbandesk.backend.controller.dto.CrearIncidenciaRequest;
import urbandesk.backend.domain.incidence.Estado;
import urbandesk.backend.domain.incidence.Incidencia;
import urbandesk.backend.domain.incidence.Prioridad;
import urbandesk.backend.domain.incidence.Ubicacion;
import urbandesk.backend.service.IncidenciaService;

@RestController
@RequestMapping("/api/incidencias")
@RequiredArgsConstructor
public class IncidenciaController {

    private final IncidenciaService incidenciaService;

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

    @GetMapping("/prioridad/{prioridad}")
    public ResponseEntity<List<Incidencia>> obtenerPorPrioridad(@PathVariable Prioridad prioridad) {
        return ResponseEntity.ok(incidenciaService.obtenerPorPrioridad(prioridad));
    }

    @GetMapping("/tecnico/{tecnicoId}")
    public ResponseEntity<List<Incidencia>> obtenerPorTecnico(@PathVariable Long tecnicoId) {
        return ResponseEntity.ok(incidenciaService.obtenerPorTecnico(tecnicoId));
    }

    @PostMapping
    public ResponseEntity<Incidencia> crearIncidencia(@RequestBody CrearIncidenciaRequest request) {
        Ubicacion ubicacion = new Ubicacion(
                request.getDireccion(),
                request.getLatitud(),
                request.getLongitud()
        );

        Incidencia incidencia = incidenciaService.crearIncidencia(
                ubicacion,
                request.getDescripcion(),
                request.getCiudadanoId()
        );

        return ResponseEntity.ok(incidencia);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Incidencia> actualizarIncidencia(
            @PathVariable Long id,
            @RequestBody ActualizarIncidenciaRequest request) {

        Ubicacion nuevaUbicacion = new Ubicacion(
                request.getDireccion(),
                request.getLatitud(),
                request.getLongitud()
        );

        Incidencia incidenciaActualizada = incidenciaService.actualizarIncidencia(
                id,
                nuevaUbicacion,
                request.getDescripcion()
        );

        return ResponseEntity.ok(incidenciaActualizada);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Incidencia> cambiarEstado(
            @PathVariable Long id,
            @RequestParam Estado nuevoEstado) {
        return ResponseEntity.ok(incidenciaService.cambiarEstado(id, nuevoEstado));
    }

    @PutMapping("/{id}/prioridad")
    public ResponseEntity<Incidencia> cambiarPrioridad(
            @PathVariable Long id,
            @RequestParam Prioridad prioridad) {
        return ResponseEntity.ok(incidenciaService.cambiarPrioridad(id, prioridad));
    }

    @PutMapping("/{id}/operador/{operadorId}")
    public ResponseEntity<Incidencia> asignarOperador(
            @PathVariable Long id,
            @PathVariable Long operadorId) {
        return ResponseEntity.ok(incidenciaService.asignarOperador(id, operadorId));
    }

    @PutMapping("/{id}/tecnico/{tecnicoId}")
    public ResponseEntity<Incidencia> asignarTecnico(
            @PathVariable Long id,
            @PathVariable Long tecnicoId) {
        return ResponseEntity.ok(incidenciaService.asignarTecnico(id, tecnicoId));
    }

    @DeleteMapping("/{id}/tecnico/{tecnicoId}")
    public ResponseEntity<Incidencia> eliminarTecnico(
            @PathVariable Long id,
            @PathVariable Long tecnicoId) {
        return ResponseEntity.ok(incidenciaService.eliminarTecnico(id, tecnicoId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarIncidencia(@PathVariable Long id) {
        incidenciaService.eliminarIncidencia(id);
        return ResponseEntity.noContent().build();
    }
}