package urbandesk.backend.controller;

import java.security.Principal;
import java.util.Objects;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import urbandesk.backend.domain.incidence.Estado;
import urbandesk.backend.domain.incidence.Incidencia;
import urbandesk.backend.domain.incidence.Prioridad;
import urbandesk.backend.domain.incidence.Ubicacion;
import urbandesk.backend.domain.user.Ciudadano;
import urbandesk.backend.domain.user.Operador;
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
        String descripcion,
        List<String> imagenes) {
    }

    public record CambioEstadoRequest(String comentario) {
    }

    private Usuario getAuthenticatedUser(Principal principal) {
        if (principal == null)
            return null;
        return usuarioService.obtenerUsuarioPorEmail(principal.getName());
    }

    @GetMapping
    public ResponseEntity<List<Incidencia>> obtenerTodas(Principal principal) {
        Usuario usuario = getAuthenticatedUser(principal);
        if (usuario instanceof Ciudadano) {
            return ResponseEntity.ok(incidenciaService.obtenerPorCiudadano(usuario.getId()));
        }
        else if (usuario instanceof Operador) {
            return ResponseEntity.ok(incidenciaService.obtenerPorOperador(usuario.getId()));
        } else{
            return ResponseEntity.ok(incidenciaService.obtenerPorTecnico(usuario.getId()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incidencia> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(incidenciaService.obtenerPorId(id));
    }

    @GetMapping("/ciudadano/{ciudadanoId}")
    public ResponseEntity<List<Incidencia>> obtenerPorCiudadano(@PathVariable Long ciudadanoId, Principal principal) {
        Usuario usuario = getAuthenticatedUser(principal);
        if (usuario == null || !Objects.equals(usuario.getId(), ciudadanoId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para ver las incidencias de otro usuario");
        }
        return ResponseEntity.ok(incidenciaService.obtenerPorCiudadano(ciudadanoId));
    }

    @GetMapping("/operador/{operadorId}")
    public ResponseEntity<List<Incidencia>> obtenerPorOperador(@PathVariable Long operadorId, Principal principal) {
        Usuario usuario = getAuthenticatedUser(principal);
        if (usuario == null || !Objects.equals(usuario.getId(), operadorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para ver las incidencias de otro operador");
        }
        return ResponseEntity.ok(incidenciaService.obtenerPorOperador(operadorId));
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
            usuarioId,
            request.imagenes()
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
            @RequestParam Estado nuevoEstado,
            @RequestBody(required = false) CambioEstadoRequest request,
            Principal principal) {

        String comentario = request != null ? request.comentario() : null;

        if (nuevoEstado == Estado.VALIDADA || nuevoEstado == Estado.RECHAZADA) {
            Usuario usuario = getAuthenticatedUser(principal);

            if (!(usuario instanceof Operador operador)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Solo un operador autenticado puede validar o rechazar incidencias");
            }

            Incidencia incidencia = incidenciaService.obtenerPorId(id);
            if (incidencia.getOperador() == null
                    || !Objects.equals(incidencia.getOperador().getId(), operador.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "La incidencia no está asignada a este operador");
            }

            if (nuevoEstado == Estado.RECHAZADA) {
                String comentarioRechazo = comentario == null || comentario.isBlank()
                        ? "Incidencia rechazada por el operador"
                        : comentario;
                return ResponseEntity.ok(incidenciaService.cambiarEstado(id, nuevoEstado, comentarioRechazo));
            }

            if (nuevoEstado == Estado.VALIDADA) {
                return ResponseEntity.ok(incidenciaService.cambiarEstado(id, nuevoEstado));
            }   
        }
        return ResponseEntity.ok(incidenciaService.cambiarEstado(id, nuevoEstado));
    }

    @PutMapping("/{id}/prioridad")
    public ResponseEntity<Incidencia> cambiarPrioridad(
            @PathVariable Long id,
            @RequestParam Prioridad prioridad,
            Principal principal) {
        
        Usuario usuario = getAuthenticatedUser(principal);
        if (!(usuario instanceof Operador operador)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo un operador autenticado puede cambiar la prioridad de una incidencia");
        }
        
        Incidencia incidencia = incidenciaService.obtenerPorId(id);
        if (incidencia.getOperador() == null
                || !Objects.equals(incidencia.getOperador().getId(), operador.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "La incidencia no está asignada a este operador");
        }

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
            @PathVariable Long tecnicoId,
            Principal principal) {

        Usuario usuario = getAuthenticatedUser(principal);
        if (!(usuario instanceof Operador operador)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo un operador autenticado puede asignar técnicos a una incidencia");
        }

        Incidencia incidencia = incidenciaService.obtenerPorId(id);
        if (incidencia.getOperador() == null
                || !Objects.equals(incidencia.getOperador().getId(), operador.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "La incidencia no está asignada a este operador");
        }

        return ResponseEntity.ok(incidenciaService.asignarTecnico(id, tecnicoId));
    }

    @DeleteMapping("/{id}/tecnico/{tecnicoId}")
    public ResponseEntity<Incidencia> eliminarTecnico(
            @PathVariable Long id,
            @PathVariable Long tecnicoId,
            Principal principal) {

        Usuario usuario = getAuthenticatedUser(principal);
        if (!(usuario instanceof Operador operador)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo un operador autenticado puede eliminar técnicos de una incidencia");
        }

        Incidencia incidencia = incidenciaService.obtenerPorId(id);
        if (incidencia.getOperador() == null
                || !Objects.equals(incidencia.getOperador().getId(), operador.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "La incidencia no está asignada a este operador");
        }

        return ResponseEntity.ok(incidenciaService.eliminarTecnico(id, tecnicoId));
    }
}