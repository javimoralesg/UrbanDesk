package urbandesk.backend.service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.incidence.Estado;
import urbandesk.backend.domain.incidence.Evidencia;
import urbandesk.backend.domain.incidence.Historial;
import urbandesk.backend.domain.incidence.Incidencia;
import urbandesk.backend.domain.incidence.Prioridad;
import urbandesk.backend.domain.incidence.Ubicacion;
import urbandesk.backend.domain.user.Ciudadano;
import urbandesk.backend.domain.user.Operador;
import urbandesk.backend.domain.user.Tecnico;
import urbandesk.backend.domain.user.Usuario;
import urbandesk.backend.repository.IncidenciaRepository;
import urbandesk.backend.repository.UsuarioRepository;

@Service
@RequiredArgsConstructor
public class IncidenciaService {

    private final IncidenciaRepository incidenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final MailService MailService;

    public Incidencia obtenerPorId(Long id) {
        return incidenciaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidencia no encontrada"));
    }

    public List<Incidencia> obtenerPorCiudadano(Long ciudadanoId) {
        return incidenciaRepository.findByCiudadanoId(ciudadanoId);
    }

    public List<Incidencia> obtenerPorOperador(Long operadorId) {
        return incidenciaRepository.findByOperadorId(operadorId);
    }

    public List<Incidencia> obtenerPorTecnico(Long tecnicoId) {
        return incidenciaRepository.findByTecnicos_Id(tecnicoId);
    }

    @Transactional
    public Incidencia crearIncidencia(Ubicacion ubicacion, String descripcion, Long ciudadanoId,
            List<String> imagenes) {
        Ciudadano ciudadano = null;

        if (ciudadanoId != null) {
            Usuario usuario = usuarioRepository.findById(ciudadanoId)
                    .orElseThrow(() -> new DomainRuleViolation("Ciudadano no encontrado"));

            if (!(usuario instanceof Ciudadano ciudadanoCast)) {
                throw new DomainRuleViolation("El usuario indicado no es un ciudadano");
            }

            ciudadano = ciudadanoCast;
        }

        Incidencia incidencia = new Incidencia(ubicacion, descripcion, ciudadano);
        if (imagenes != null) {
            for (String imagen : imagenes) {
                if (imagen != null && !imagen.isBlank()) {
                    incidencia.agregarEvidencia(new Evidencia(imagen, incidencia, ciudadano));
                }
            }
        }
        incidencia.agregarHistorial(new Historial(
                incidencia,
                ciudadano,
                Estado.CREADA,
                "Incidencia creada"));
        Incidencia incidenciaGuardada = incidenciaRepository.save(incidencia);

        if (ciudadano != null) {
            MailService.enviarIncidenciaCreada(ciudadano.getEmail(), incidenciaGuardada.getId(), ciudadano.getNombre());
        }

        asignarOperadorAutomatico(incidenciaGuardada.getId());

        return incidenciaGuardada;
    }

    public Incidencia actualizarIncidencia(Long id, Ubicacion nuevaUbicacion, String nuevaDescripcion) {
        Incidencia incidencia = obtenerPorId(id);
        incidencia.modificarIncidencia(nuevaUbicacion, nuevaDescripcion);
        return incidenciaRepository.save(incidencia);
    }

    public Incidencia validarIncidencia(Long incidenciaId, Long operadorId, String observaciones, String prioridadStr) {
        Incidencia incidencia = obtenerPorId(incidenciaId);

        if (prioridadStr == null || prioridadStr.isBlank()) {
            throw new DomainRuleViolation("Debe asignar una prioridad al validar la incidencia.");
        }
        try {
            Prioridad prioridad = Prioridad.valueOf(prioridadStr);
            if (prioridad == Prioridad.SIN_ASIGNAR) {
                throw new DomainRuleViolation("Debe seleccionar una prioridad válida.");
            }
            incidencia.asignarPrioridad(prioridad);
        } catch (IllegalArgumentException e) {
            throw new DomainRuleViolation("Prioridad no válida: " + prioridadStr);
        }

        incidencia.actualizarEstado(Estado.VALIDADA);

        String hayObservaciones = observaciones == null || observaciones.isBlank() ? "."
                : ". Observaciones del operador: " + observaciones;

        String observacionFinal = "Incidencia validada con una prioridad: " + prioridadStr + hayObservaciones;

        incidencia.agregarHistorial(new Historial(
                incidencia,
                incidencia.getOperador(),
                Estado.VALIDADA,
                observacionFinal));

        Incidencia incidenciaGuardada = incidenciaRepository.save(incidencia);

        if (incidencia.getCiudadano() != null) {
            MailService.enviarCambioEstado(
                    incidencia.getCiudadano().getEmail(),
                    incidencia.getId(),
                    incidencia.getDescripcion(),
                    Estado.VALIDADA);
        }
        return incidenciaGuardada;
    }

    public Incidencia rechazarIncidencia(Long id, String comentario) {
        Incidencia incidencia = obtenerPorId(id);
        incidencia.actualizarEstado(Estado.RECHAZADA);

        String hayObservaciones = comentario == null || comentario.isBlank() ? "."
                : ". Observaciones del operador:" + comentario;

        String observacionFinal = "Incidencia rechazada" + hayObservaciones;

        incidencia.agregarHistorial(new Historial(
                incidencia,
                incidencia.getOperador(),
                Estado.RECHAZADA,
                observacionFinal));
        Incidencia incidenciaGuardada = incidenciaRepository.save(incidencia);
        if (incidencia.getCiudadano() != null) {
            MailService.enviarCambioEstado(
                    incidencia.getCiudadano().getEmail(),
                    incidencia.getId(),
                    incidencia.getDescripcion(),
                    Estado.RECHAZADA);
        }
        return incidenciaGuardada;
    }

    @Transactional
    public Incidencia asignarOperadorAutomatico(Long incidenciaId) {
        Incidencia incidencia = obtenerPorId(incidenciaId);

        Operador operadorConMenorCarga = usuarioRepository.findAll().stream()
                .filter(Operador.class::isInstance)
                .map(Operador.class::cast)
                .filter(Operador::tieneDisponibilidad)
                .min(Comparator
                        .comparing(Operador::getCargaActual, Comparator.nullsFirst(Integer::compareTo))
                        .thenComparing(Operador::getId))
                .orElse(null);

        if (operadorConMenorCarga == null) {
            return incidencia;
        }

        operadorConMenorCarga.incrementarCarga();
        usuarioRepository.save(operadorConMenorCarga);

        incidencia.asignarOperador(operadorConMenorCarga);

        incidencia.agregarHistorial(new Historial(
                incidencia,
                operadorConMenorCarga,
                Estado.CREADA,
                "Incidencia asignada a un operador"));

        Incidencia incidenciaGuardada = incidenciaRepository.save(incidencia);

        return incidenciaGuardada;
    }

    public Incidencia asignarTecnico(Long incidenciaId, Long tecnicoId) {
        Incidencia incidencia = obtenerPorId(incidenciaId);

        Usuario usuario = usuarioRepository.findById(tecnicoId)
                .orElseThrow(() -> new DomainRuleViolation("Técnico no encontrado"));

        if (!(usuario instanceof Tecnico tecnico)) {
            throw new DomainRuleViolation("El usuario indicado no es un técnico");
        }

        incidencia.agregarTecnico(tecnico);
        return incidenciaRepository.save(incidencia);
    }

    public Incidencia eliminarTecnico(Long incidenciaId, Long tecnicoId) {
        Incidencia incidencia = obtenerPorId(incidenciaId);

        Usuario usuario = usuarioRepository.findById(tecnicoId)
                .orElseThrow(() -> new DomainRuleViolation("Técnico no encontrado"));

        if (!(usuario instanceof Tecnico tecnico)) {
            throw new DomainRuleViolation("El usuario indicado no es un técnico");
        }

        incidencia.eliminarTecnico(tecnico);
        return incidenciaRepository.save(incidencia);
    }

}
