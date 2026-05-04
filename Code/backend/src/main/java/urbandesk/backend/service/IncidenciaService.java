package urbandesk.backend.service;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Optional;

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
import urbandesk.backend.domain.user.Especialidad;
import urbandesk.backend.domain.user.Operador;
import urbandesk.backend.domain.user.Tecnico;
import urbandesk.backend.domain.user.Usuario;
import urbandesk.backend.dto.IncidenciaPublicaDTO;
import urbandesk.backend.repository.IncidenciaRepository;
import urbandesk.backend.repository.UsuarioRepository;
import urbandesk.backend.repository.OperadorRepository;


@Service
@RequiredArgsConstructor
public class IncidenciaService {

    private final IncidenciaRepository incidenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final OperadorRepository operadorRepository;
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
        List<Incidencia> incidencias = incidenciaRepository.findByTecnicos_Id(tecnicoId);
        return incidencias.stream()
                .filter(incidencia -> !incidencia.getTecnicosFinalizadosIds().contains(tecnicoId))
                .toList();
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
            MailService.enviarIncidenciaCreada(ciudadano.getEmail(), incidenciaGuardada.getId(), incidenciaGuardada.getDescripcion());
        }

        asignarOperadorAutomatico(incidenciaGuardada.getId());

        return incidenciaGuardada;
    }

@Transactional
public Incidencia actualizarIncidencia(
        Long id,
        Ubicacion nuevaUbicacion,
        String nuevaDescripcion,
        List<String> imagenesNuevas,
        List<Long> imagenesExistentesIds
) {
    Incidencia incidencia = obtenerPorId(id);

    incidencia.modificarIncidencia(nuevaUbicacion, nuevaDescripcion);

    List<Evidencia> evidenciasActuales = incidencia.getEvidencias();

    List<Evidencia> evidenciasFiltradas = evidenciasActuales.stream()
            .filter(ev -> imagenesExistentesIds != null && imagenesExistentesIds.contains(ev.getId()))
            .toList();

    incidencia.getEvidencias().clear();
    incidencia.getEvidencias().addAll(evidenciasFiltradas);

    if (imagenesNuevas != null) {
        for (String imagen : imagenesNuevas) {
            if (imagen != null && !imagen.isBlank()) {
                incidencia.agregarEvidencia(
                        new Evidencia(imagen, incidencia, incidencia.getCiudadano())
                );
            }
        }
    }

    incidencia.agregarHistorial(new Historial(
            incidencia,
            incidencia.getCiudadano(),
            Estado.CREADA, // o el estado actual si quieres mantenerlo
            "Incidencia actualizada"
    ));

    return incidenciaRepository.save(incidencia);
}

    @Transactional
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

    @Transactional
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

    public void asignarOperadorAutomatico(Long incidenciaId) {
        Incidencia incidencia = obtenerPorId(incidenciaId);

        List<Operador> operadores = operadorRepository.findAll();

        Optional<Operador> operadorOpt = operadores.stream()
                .filter(o -> o.getCargaActual() < o.getCargaMaxima())
                .sorted(java.util.Comparator.comparing(Operador::getCargaActual))
                .findFirst();

        if (operadorOpt.isPresent()) {
            Operador operadorConMenorCarga = operadorOpt.get();

            incidencia.asignarOperador(operadorConMenorCarga);

            operadorConMenorCarga.incrementarCarga();
            operadorRepository.save(operadorConMenorCarga);

            incidencia.agregarHistorial(new Historial(
                    incidencia,
                    operadorConMenorCarga,
                    Estado.CREADA,
                    "Incidencia asignada a un operador"));

            Incidencia incidenciaGuardada = incidenciaRepository.save(incidencia);
            
            MailService.enviarIncidenciaAsignadaOperador(
                    operadorConMenorCarga.getEmail(),
                    incidenciaGuardada.getId(),
                    incidenciaGuardada.getDescripcion(),
                    incidenciaGuardada.getUbicacion());
        }
    }

    @Transactional
    public Incidencia asignarTecnico(Long incidenciaId, Long tecnicoId) {
        Incidencia incidencia = obtenerPorId(incidenciaId);

        Usuario usuario = usuarioRepository.findById(tecnicoId)
                .orElseThrow(() -> new DomainRuleViolation("Técnico no encontrado"));

        if (!(usuario instanceof Tecnico tecnico)) {
            throw new DomainRuleViolation("El usuario indicado no es un técnico");
        }

        incidencia.agregarTecnico(tecnico);
        tecnico.incrementarCarga();

        incidencia.actualizarEstado(Estado.ASIGNADA);
        usuarioRepository.save(tecnico);

        Incidencia incidenciaGuardada = incidenciaRepository.save(incidencia);
        
        MailService.enviarIncidenciaAsignadaTecnico(
            tecnico.getEmail(),
            incidenciaGuardada.getId(),
            incidenciaGuardada.getDescripcion(),
            incidenciaGuardada.getUbicacion()
    );

    return incidenciaGuardada;
        
    }

    @Transactional
    public Incidencia asignarTecnicoPorEspecialidad(Long incidenciaId, Especialidad especialidad) {
        Incidencia incidencia = obtenerPorId(incidenciaId);

        Tecnico tecnicoSeleccionado = usuarioRepository.findAll().stream()
                .filter(Tecnico.class::isInstance)
                .map(Tecnico.class::cast)
                .filter(tecnico -> tecnico.getEspecialidad() == especialidad)
                .filter(Tecnico::tieneDisponibilidad)
                .filter(tecnico -> incidencia.getTecnicos().stream()
                        .noneMatch(t -> Objects.equals(t.getId(), tecnico.getId())))
                .min(Comparator
                        .comparing(Tecnico::getCargaActual, Comparator.nullsFirst(Integer::compareTo))
                        .thenComparing(Tecnico::getId))
                .orElseThrow(() -> new DomainRuleViolation(
                        "No hay técnicos disponibles para la especialidad: " + especialidad));

        incidencia.agregarTecnico(tecnicoSeleccionado);
        tecnicoSeleccionado.incrementarCarga();
        
        usuarioRepository.save(tecnicoSeleccionado);

        incidencia.actualizarEstado(Estado.ASIGNADA);

        Incidencia incidenciaGuardada = incidenciaRepository.save(incidencia);
        
        MailService.enviarIncidenciaAsignadaTecnico(
            tecnicoSeleccionado.getEmail(),
            incidenciaGuardada.getId(),
            incidenciaGuardada.getDescripcion(),
            incidenciaGuardada.getUbicacion()
    );
    return incidenciaGuardada;
    }

    @Transactional
    public Incidencia eliminarTecnicoPorEspecialidad(Long incidenciaId, Especialidad especialidad) {
        Incidencia incidencia = obtenerPorId(incidenciaId);

        Tecnico tecnicoSeleccionado = incidencia.getTecnicos().stream()
                .filter(tecnico -> tecnico.getEspecialidad() == especialidad)
                .findFirst()
                .orElseThrow(() -> new DomainRuleViolation(
                        "No hay técnicos asignados para la especialidad: " + especialidad));

        if (tecnicoHaAceptadoIncidencia(incidencia, tecnicoSeleccionado)) {
            throw new DomainRuleViolation(
                "No se puede desasignar al técnico de " + especialidad
                    + " porque ya ha aceptado la incidencia.");
        }

        incidencia.eliminarTecnico(tecnicoSeleccionado);
        tecnicoSeleccionado.decrementarCarga();

        Estado nuevoEstado = !incidencia.getTecnicos().isEmpty() ? Estado.ASIGNADA : Estado.VALIDADA;
        if (incidencia.getEstado() == Estado.EN_CURSO) {
            nuevoEstado = Estado.EN_CURSO;
        }

        boolean todosFinalizados = incidencia.coincidenTecnicosFinalizadosConAsignados();

        Tecnico tecnico = incidencia.getTecnicos().stream()
                .findFirst()
                .orElse(null);

        if (todosFinalizados) {
            incidencia.actualizarEstado(Estado.RESUELTA);
            incidencia.agregarHistorial(new Historial(
                incidencia,
                tecnico,
                Estado.RESUELTA,
                "Todos los técnicos han finalizado. "));

            Incidencia incidenciaGuardada = incidenciaRepository.save(incidencia);

            if (incidencia.getCiudadano() != null) {
                MailService.enviarIncidenciaResuelta(
                    incidencia.getCiudadano().getEmail(),
                    incidencia.getId(),
                    incidencia.getDescripcion());
            }

        return incidenciaGuardada;
     }

        incidencia.actualizarEstado(nuevoEstado);

        usuarioRepository.save(tecnicoSeleccionado);
        return incidenciaRepository.save(incidencia);
    }

    @Transactional
    public Incidencia actualizarTecnicosPorEspecialidades(Long incidenciaId, Set<Especialidad> especialidadesObjetivo) {
        Incidencia incidencia = obtenerPorId(incidenciaId);

        Set<Especialidad> objetivo = especialidadesObjetivo == null
                ? Set.of()
                : new LinkedHashSet<>(especialidadesObjetivo);

        Set<Especialidad> especialidadesActuales = incidencia.getTecnicos().stream()
                .map(Tecnico::getEspecialidad)
                .collect(Collectors.toSet());

        for (Especialidad especialidadActual : especialidadesActuales) {
            if (!objetivo.contains(especialidadActual)) {
                incidencia = eliminarTecnicoPorEspecialidad(incidencia.getId(), especialidadActual);
            }
        }

        for (Especialidad especialidadObjetivo : objetivo) {
            boolean yaAsignada = incidencia.getTecnicos().stream()
                    .anyMatch(tecnico -> tecnico.getEspecialidad() == especialidadObjetivo);
            if (!yaAsignada) {
                incidencia = asignarTecnicoPorEspecialidad(incidencia.getId(), especialidadObjetivo);
            }
        }

        return incidencia;
    }

    @Transactional
    public Incidencia eliminarTecnico(Long incidenciaId, Long tecnicoId) {
        Incidencia incidencia = obtenerPorId(incidenciaId);

        Usuario usuario = usuarioRepository.findById(tecnicoId)
                .orElseThrow(() -> new DomainRuleViolation("Técnico no encontrado"));

        if (!(usuario instanceof Tecnico tecnico)) {
            throw new DomainRuleViolation("El usuario indicado no es un técnico");
        }

        if (tecnicoHaAceptadoIncidencia(incidencia, tecnico)) {
            throw new DomainRuleViolation(
                    "No se puede desasignar al técnico " + tecnico.getNombre()
                            + " porque ya ha aceptado la incidencia.");
        }

        tecnico.decrementarCarga();
        usuarioRepository.save(tecnico);
        incidencia.eliminarTecnico(tecnico);

         Estado nuevoEstado = !incidencia.getTecnicos().isEmpty() ? Estado.ASIGNADA : Estado.VALIDADA;
        incidencia.actualizarEstado(nuevoEstado);

        return incidenciaRepository.save(incidencia);
    }

    private boolean tecnicoHaAceptadoIncidencia(Incidencia incidencia, Tecnico tecnico) {
        if (incidencia == null || tecnico == null) {
            return false;
        }

        return incidencia.getHistoriales().stream()
                .anyMatch((entrada) -> {
                    Usuario usuarioHistorial = entrada.getUsuario();
                    String observaciones = entrada.getObservaciones();
                    return usuarioHistorial != null
                            && Objects.equals(usuarioHistorial.getId(), tecnico.getId())
                            && observaciones != null
                            && observaciones.toLowerCase().contains("ha aceptado la incidencia");
                });
    }

    @Transactional
    public Incidencia aceptarIncidenciaTecnico(Long id, Long tecnicoId) {
        Incidencia incidencia = obtenerPorId(id);

        if (incidencia.getEstado() != Estado.VALIDADA && incidencia.getEstado() != Estado.ASIGNADA && incidencia.getEstado() != Estado.EN_CURSO) {
            throw new DomainRuleViolation("Solo se pueden aceptar incidencias que estén en estado VALIDADA, ASIGNADA o EN CURSO");
        }

        Tecnico tecnico = incidencia.getTecnicos().stream()
                .filter(t -> Objects.equals(t.getId(), tecnicoId))
                .findFirst()
                .orElseThrow(() -> new DomainRuleViolation("Técnico no asignado a esta incidencia"));

        incidencia.actualizarEstado(Estado.EN_CURSO);

        String observacionFinal = tecnico.getEspecialidad().toString() +  " ha aceptado la incidencia.";

        incidencia.agregarHistorial(new Historial(
                incidencia,
                tecnico,
                Estado.EN_CURSO,
                observacionFinal));

        Incidencia incidenciaGuardada = incidenciaRepository.save(incidencia);

        if (incidencia.getCiudadano() != null) {
            MailService.enviarCambioEstado(
                    incidencia.getCiudadano().getEmail(),
                    incidencia.getId(),
                    incidencia.getDescripcion(),
                    Estado.EN_CURSO);
        }
        return incidenciaGuardada;
    }

    @Transactional
    public Incidencia rechazarIncidenciaTecnico(Long id, Long tecnicoId, String comentario) {
        if (comentario == null || comentario.isBlank()) {
        throw new DomainRuleViolation("El técnico debe añadir un comentario al resolver la incidencia.");
        }
        Incidencia incidencia = obtenerPorId(id);

        if (incidencia.getEstado() != Estado.VALIDADA && incidencia.getEstado() != Estado.ASIGNADA) {
            throw new DomainRuleViolation("Solo se pueden rechazar incidencias que estén en estado VALIDADA o ASIGNADA");
        }

        Tecnico tecnico = incidencia.getTecnicos().stream()
                .filter(t -> Objects.equals(t.getId(), tecnicoId))
                .findFirst()
                .orElseThrow(() -> new DomainRuleViolation("Técnico no asignado a esta incidencia"));

        String observacionFinal = tecnico.getEspecialidad().toString() +  " ha rechazado la incidencia.";

        tecnico.decrementarCarga();
        usuarioRepository.save(tecnico);
        incidencia.eliminarTecnico(tecnico);

        Estado nuevoEstado = Estado.VALIDADA;
        if (incidencia.getEstado() == Estado.ASIGNADA && !incidencia.getTecnicos().isEmpty()) {
            nuevoEstado = Estado.ASIGNADA;
        } else if (incidencia.getEstado() == Estado.EN_CURSO) {
            nuevoEstado = Estado.EN_CURSO;
        }
        
        incidencia.actualizarEstado(nuevoEstado);

        incidencia.agregarHistorial(new Historial(
                incidencia,
                tecnico,
                nuevoEstado,
                observacionFinal));

        Incidencia incidenciaGuardada = incidenciaRepository.save(incidencia);

        if (incidenciaGuardada.getOperador() != null) {
            MailService.enviarIncidenciaRechazadaPorTecnico(
                    incidenciaGuardada.getOperador().getEmail(),
                    incidenciaGuardada.getId(),
                    incidenciaGuardada.getDescripcion(),
                    tecnico.getNombre(),
                    comentario);
}

        if (incidencia.getCiudadano() != null) {
            MailService.enviarCambioEstado(
                    incidencia.getCiudadano().getEmail(),
                    incidencia.getId(),
                    incidencia.getDescripcion(),
                    nuevoEstado);
        }
        return incidenciaGuardada;
    }

    @Transactional
    public Incidencia resolverIncidenciaTecnico(Long incidenciaId, Long tecnicoId, String comentario) {

    if (comentario == null || comentario.isBlank()) {
        throw new DomainRuleViolation("El técnico debe añadir un comentario al resolver la incidencia.");
    }

    Incidencia incidencia = obtenerPorId(incidenciaId);

    if (incidencia.getTecnicosFinalizadosIds().contains(tecnicoId)) {
        throw new DomainRuleViolation("Ya ha sido marcada como resuelta en esta incidencia.");
    }

    boolean esTecnicoAsignado = incidencia.getTecnicos().stream()
            .anyMatch(t -> t.getId().equals(tecnicoId));

    if (!esTecnicoAsignado) {
        throw new DomainRuleViolation("El técnico no está asignado a esta incidencia.");
    }

    if (incidencia.getEstado() != Estado.EN_CURSO) {
        throw new DomainRuleViolation("Solo se pueden resolver incidencias en estado EN_CURSO.");
    }

    Usuario tecnico = usuarioRepository.findById(tecnicoId)
            .orElseThrow(() -> new DomainRuleViolation("Técnico no encontrado"));

    // Marcar técnico como finalizado y liberar su carga
    incidencia.marcarTecnicoFinalizado(tecnicoId);

    if (tecnico instanceof Tecnico tecnicoCast) {
        tecnicoCast.decrementarCarga();
        usuarioRepository.save(tecnicoCast);
    }

    boolean todosFinalizados = incidencia.coincidenTecnicosFinalizadosConAsignados();

    if (todosFinalizados) {
        incidencia.actualizarEstado(Estado.RESUELTA);
        incidencia.agregarHistorial(new Historial(
                incidencia,
                tecnico,
                Estado.RESUELTA,
                "Todos los técnicos han finalizado. " + comentario));

        Incidencia incidenciaGuardada = incidenciaRepository.save(incidencia);

        if (incidencia.getCiudadano() != null) {
            MailService.enviarIncidenciaResuelta(
                    incidencia.getCiudadano().getEmail(),
                    incidencia.getId(),
                    incidencia.getDescripcion());
        }

        return incidenciaGuardada;
    }

    incidencia.agregarHistorial(new Historial(
            incidencia,
            tecnico,
            Estado.EN_CURSO,
            "Técnico ha finalizado su parte. " + comentario));

    return incidenciaRepository.save(incidencia);
    }

    public List<IncidenciaPublicaDTO> obtenerIncidenciasPublicas() {

        List<Estado> estadosExcluir = List.of(
            Estado.CERRADA,
            Estado.RECHAZADA,
            Estado.CREADA   // opcional (yo lo pondría)
        );

        return incidenciaRepository.findByEstadoNotIn(estadosExcluir)
            .stream()
            .map(i -> new IncidenciaPublicaDTO(
                i.getId(),
                i.getFechaCreacion(),
                i.getEstado().name(),
                i.getDescripcion(),
                i.getPrioridad().name(),
                i.getUbicacion().getDireccion()
            ))
            .toList();
    }

    @Transactional
    public Incidencia cerrarIncidencia(Long id, String comentario) {
        if (comentario == null || comentario.isBlank()) {
            throw new DomainRuleViolation("El operador debe añadir un comentario al cerrar la incidencia.");
        }
        Incidencia incidencia = obtenerPorId(id);

        if (incidencia.getEstado() != Estado.RESUELTA) {
            throw new DomainRuleViolation("Solo se pueden cerrar incidencias que estén en estado RESUELTA");
        }

        incidencia.actualizarEstado(Estado.CERRADA);

        String hayObservaciones = comentario == null || comentario.isBlank() ? "."
                : "Observaciones del operador: " + comentario;

        String observacionFinal = "Incidencia cerrada por el operador. " + hayObservaciones;

        incidencia.agregarHistorial(new Historial(
                incidencia,
                incidencia.getOperador(),
                Estado.CERRADA,
                observacionFinal));
        Incidencia incidenciaGuardada = incidenciaRepository.save(incidencia);
        if (incidencia.getCiudadano() != null) {
            MailService.enviarCambioEstado(
                    incidencia.getCiudadano().getEmail(),
                    incidencia.getId(),
                    incidencia.getDescripcion(),
                    Estado.CERRADA);
        }
        return incidenciaGuardada;
    }
}
