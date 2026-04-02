package urbandesk.backend.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import urbandesk.backend.domain.incidence.Estado;
import urbandesk.backend.domain.incidence.Incidencia;
import urbandesk.backend.domain.incidence.Prioridad;
import urbandesk.backend.domain.incidence.Ubicacion;
import urbandesk.backend.domain.user.Usuario;
import urbandesk.backend.service.IncidenciaService;
import urbandesk.backend.service.UsuarioService;

@RestController
@RequestMapping("/api/incidencias")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class IncidenciaController {

    private final IncidenciaService incidenciaService;
    private final UsuarioService usuarioService;

    public record IncidenciaRequest(
        String direccion,
        Double latitud,
        Double longitud,
        String descripcion) {
    }

    private Usuario getAuthenticatedUser(Principal principal) {
        if (principal == null)
            return null;
        return usuarioService.obtenerUsuarioPorEmail(principal.getName());
    }

    @GetMapping
    public ResponseEntity<List<Incidencia>> obtenerTodas() {
        return ResponseEntity.ok(incidenciaService.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incidencia> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(incidenciaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<?> crearIncidencia(@RequestBody IncidenciaRequest request, Principal principal) {

        Usuario usuario = getAuthenticatedUser(principal);
        Long usuarioId = usuario != null ? usuario.getId() : null;

        Ubicacion ubicacion = new Ubicacion(
            request.direccion(),
            request.latitud(),
            request.longitud()
        );

        Incidencia incidencia = incidenciaService.crearIncidencia(
            ubicacion,
            request.descripcion(),
            usuarioId
        );

        return ResponseEntity.ok(incidencia);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Incidencia> actualizarIncidencia(
            @PathVariable Long id,
            @RequestBody IncidenciaRequest request) {

        Ubicacion nuevaUbicacion = new Ubicacion(
                request.direccion(),
                request.latitud(),
                request.longitud()
        );

        Incidencia incidenciaActualizada = incidenciaService.actualizarIncidencia(
                id,
                nuevaUbicacion,
                request.descripcion()
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

    @PutMapping("/{id}/operador")
    public ResponseEntity<Incidencia> asignarOperadorAutomatico(@PathVariable Long id) {
        return ResponseEntity.ok(incidenciaService.asignarOperadorAutomatico(id));
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