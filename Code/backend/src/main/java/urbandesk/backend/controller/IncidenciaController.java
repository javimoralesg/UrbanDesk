package urbandesk.backend.controller;

import java.security.Principal;
import java.util.Objects;
import java.util.List;

import org.apache.catalina.connector.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.incidence.Estado;
import urbandesk.backend.domain.incidence.Incidencia;
import urbandesk.backend.domain.incidence.Ubicacion;
import urbandesk.backend.domain.user.Ciudadano;
import urbandesk.backend.domain.user.Especialidad;
import urbandesk.backend.domain.user.Operador;
import urbandesk.backend.domain.user.Tecnico;
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
            List<String> imagenes,
            List<String> imagenesNuevas,
            List<Long> imagenesExistentes
            ) {
    }

    public record Comentario(String comentario) {
    }

    private Usuario getAuthenticatedUser(Principal principal) {
        if (principal == null)
            return null;
        return usuarioService.obtenerUsuarioPorEmail(principal.getName());
    }

    @GetMapping
    public ResponseEntity<List<Incidencia>> obtenerTodas(Principal principal) {
        Usuario usuario = getAuthenticatedUser(principal);
        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Debes estar autenticado para ver las incidencias");
        }
        if (usuario instanceof Ciudadano) {
            return ResponseEntity.ok(incidenciaService.obtenerPorCiudadano(usuario.getId()));
        } else if (usuario instanceof Operador) {
            return ResponseEntity.ok(incidenciaService.obtenerPorOperador(usuario.getId()));
        } else {
            return ResponseEntity.ok(incidenciaService.obtenerPorTecnico(usuario.getId()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incidencia> obtenerPorId(@PathVariable Long id, Principal principal) {
        Usuario usuario = getAuthenticatedUser(principal);
        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Debes estar autenticado para ver las incidencias");
        }
        Incidencia incidencia = incidenciaService.obtenerPorId(id);
        if (usuario instanceof Ciudadano ciudadano) {
            if (incidencia.getCiudadano() == null
                    || !Objects.equals(incidencia.getCiudadano().getId(), ciudadano.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para ver esta incidencia");
            }
        } else if (usuario instanceof Operador operador) {
            if (incidencia.getOperador() == null
                    || !Objects.equals(incidencia.getOperador().getId(), operador.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para ver esta incidencia");
            }
        } else if (usuario instanceof Tecnico tecnico) {
            boolean asignado = incidencia.getTecnicos().stream()
                    .anyMatch(t -> Objects.equals(t.getId(), tecnico.getId()));
            if (!asignado) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para ver esta incidencia");
            }
        }
        return ResponseEntity.ok(incidenciaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<?> crearIncidencia(@RequestBody IncidenciaRequest request, Principal principal) {

        Usuario usuario = getAuthenticatedUser(principal);
        Long usuarioId = usuario != null ? usuario.getId() : null;

        Ubicacion ubicacion = new Ubicacion(
                request.direccion(),
                request.latitud(),
                request.longitud());

        Incidencia incidencia = incidenciaService.crearIncidencia(
                ubicacion,
                request.descripcion(),
                usuarioId,
                request.imagenes());

        return ResponseEntity.ok(incidencia);
    }

    @PutMapping("/{id}/editar")
    public ResponseEntity<Incidencia> actualizarIncidencia(
            @PathVariable Long id,
            @RequestBody IncidenciaRequest request,
            Principal principal) {

        Usuario usuario = getAuthenticatedUser(principal);
        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Debes estar autenticado para editar una incidencia");
        }

        Incidencia incidencia = incidenciaService.obtenerPorId(id);
        if (incidencia.getCiudadano() == null || !Objects.equals(incidencia.getCiudadano().getId(), usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para editar esta incidencia");
        }

        if (incidencia.getEstado() != Estado.CREADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Solo se pueden editar las incidencias en estado CREADA");
        }

        Ubicacion nuevaUbicacion = new Ubicacion(
                request.direccion() != null && !request.direccion().isBlank() ? request.direccion()
                        : incidencia.getUbicacion().getDireccion(),
                request.latitud() != null ? request.latitud() : incidencia.getUbicacion().getLatitud(),
                request.longitud() != null ? request.longitud() : incidencia.getUbicacion().getLongitud());

        Incidencia incidenciaActualizada = incidenciaService.actualizarIncidencia(
                id,
                nuevaUbicacion,
                request.descripcion() != null && !request.descripcion().isBlank()
                        ? request.descripcion()
                        : incidencia.getDescripcion(),
                request.imagenesNuevas() != null ? request.imagenesNuevas() : List.of(),
                request.imagenesExistentes() != null ? request.imagenesExistentes() : List.of()
        );
        return ResponseEntity.ok(incidenciaActualizada);
    }

    @PutMapping("/{id}/validar")
    public ResponseEntity<Incidencia> validarIncidencia(
            @PathVariable Long id,
            @RequestParam String observaciones,
            @RequestParam String prioridad,
            Principal principal) {

        Usuario usuario = getAuthenticatedUser(principal);
        if ((!(usuario instanceof Operador)))
            throw new DomainRuleViolation("Solo los operadores pueden validar incidencias.");

        return ResponseEntity
                .ok(incidenciaService.validarIncidencia(id, usuario.getId(), observaciones, prioridad));
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<Incidencia> rechazarIncidencia(@PathVariable Long id,
            @RequestBody(required = false) Comentario request, Principal principal) {
        Usuario usuario = getAuthenticatedUser(principal);
        if (usuario == null || !(usuario instanceof Operador)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo un operador autenticado puede rechazar una incidencia");
        }

        Incidencia incidencia = incidenciaService.obtenerPorId(id);
        if (incidencia.getOperador() == null || !Objects.equals(incidencia.getOperador().getId(), usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La incidencia no está asignada a este operador");
        }

        return ResponseEntity
                .ok(incidenciaService.rechazarIncidencia(id, request != null ? request.comentario() : null));
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

    @PutMapping("/{id}/tecnico")
    public ResponseEntity<Incidencia> asignarTecnico(
            @PathVariable Long id,
            @RequestParam String especialidad,
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

        Especialidad especialidadEnum;
        try {
            especialidadEnum = Especialidad.valueOf(especialidad.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Especialidad no válida: " + especialidad);
        }

        return ResponseEntity.ok(incidenciaService.asignarTecnicoPorEspecialidad(id, especialidadEnum));
    }

    @DeleteMapping("/{id}/tecnico")
    public ResponseEntity<Incidencia> eliminarTecnico(
            @PathVariable Long id,
            @RequestParam String especialidad,
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

        Especialidad especialidadEnum;
        try {
            especialidadEnum = Especialidad.valueOf(especialidad.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Especialidad no válida: " + especialidad);
        }

        return ResponseEntity.ok(incidenciaService.eliminarTecnicoPorEspecialidad(id, especialidadEnum));
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

    @PutMapping("/{id}/aceptar/{tecnicoId}")
    public ResponseEntity<Incidencia> aceptarIncidencia(
            @PathVariable Long id,
            @PathVariable Long tecnicoId,
            Principal principal) {

        Usuario usuario = getAuthenticatedUser(principal);
        if (!(usuario instanceof Tecnico tecnico)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo un técnico autenticado puede aceptar una incidencia");
        }

        Incidencia incidencia = incidenciaService.obtenerPorId(id);
        boolean asignado = incidencia.getTecnicos().stream()
                .anyMatch(t -> Objects.equals(t.getId(), tecnico.getId()));
        if (!asignado) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No estás asignado a esta incidencia");
        }

        return ResponseEntity.ok(incidenciaService.aceptarIncidenciaTecnico(id, tecnicoId));
    }

    @DeleteMapping("/{id}/rechazar/{tecnicoId}")
    public ResponseEntity<Incidencia> rechazarIncidencia(
            @PathVariable Long id,
            @PathVariable Long tecnicoId,
            @RequestParam String comentario,
            Principal principal) {
        Usuario usuario = getAuthenticatedUser(principal);
        if (!(usuario instanceof Tecnico tecnico)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo un técnico autenticado puede rechazar una incidencia");
        }

        Incidencia incidencia = incidenciaService.obtenerPorId(id);
        boolean asignado = incidencia.getTecnicos().stream()
                .anyMatch(t -> Objects.equals(t.getId(), tecnico.getId()));
        if (!asignado) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No estás asignado a esta incidencia");
        }

        return ResponseEntity.ok(incidenciaService.rechazarIncidenciaTecnico(id, tecnicoId, comentario));
    }
    
    @PutMapping("/{id}/tecnico/{tecnicoId}/resolver")
    public ResponseEntity<Incidencia> resolver(
        @PathVariable Long id,
        @PathVariable Long tecnicoId,
        @RequestParam String comentario) {
    return ResponseEntity.ok(incidenciaService.resolverIncidenciaTecnico(id, tecnicoId, comentario));
    }

}