package urbandesk.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.incidence.Estado;
import urbandesk.backend.domain.incidence.Incidencia;
import urbandesk.backend.repository.*;
import urbandesk.backend.domain.incidence.Prioridad;
import urbandesk.backend.domain.incidence.Ubicacion;
import urbandesk.backend.domain.user.Ciudadano;
import urbandesk.backend.domain.user.Operador;

@Service
@RequiredArgsConstructor

public class IncidenciaService {
    private final IncidenciaRepository incidenciaRepository;
    private final UsuarioRepository    usuarioRepository;
    private final UbicacionRepository  ubicacionRepository;
    private final OperadorRepository   operadorRepository;


    public List<Incidencia> getIncidenciaList() {
        return incidenciaRepository.findAll();
    }

    public Incidencia getIncidenciaById(Long id) {
        return incidenciaRepository.findById(id).orElseThrow(() -> new DomainRuleViolation("Incidencia no encontrada"));
    }

    public List<Incidencia> getIncidenciasByEstado(Estado estado) {
        return incidenciaRepository.findByEstado(estado);
    }

    public List<Incidencia> getIncidenciasByCiudadanoId(Long ciudadanoId) {
        return incidenciaRepository.findByCiudadanoId(ciudadanoId);
    }

    public List<Incidencia> getIncidenciasByPrioridad(Prioridad prioridad) {
        return incidenciaRepository.findByPrioridad(prioridad);
    }

    public List<Incidencia> obtenerPorTecnico(Long tecnicoId) {
        return incidenciaRepository.findByTecnicoId(tecnicoId);
    }
    public Incidencia crearIncidencia(Incidencia incidencia) {
        incidencia.setFechaCreacion(LocalDateTime.now());
        incidencia.setEstado(Estado.CREADA);
        return incidenciaRepository.save(incidencia);
    }
    public Incidencia actualizarEstado(Long id, Estado nuevoEstado) {
        Incidencia incidencia = getIncidenciaById(id);
        incidencia.setEstado(nuevoEstado);
        return incidenciaRepository.save(incidencia);
    }
    public Incidencia asignarOperador(Long incidenciaId, Long operadorId) {
        Incidencia incidencia = getIncidenciaById(incidenciaId);
        Operador operador = operadorRepository.findById(operadorId)
            .orElseThrow(() -> new DomainRuleViolation("Operador no encontrado"));

        incidencia.setOperador(operador);
        return incidenciaRepository.save(incidencia);
    }
    public void deleteIncidencia(Long id) {
        Incidencia incidencia = getIncidenciaById(id);
        incidenciaRepository.delete(incidencia);
    }
    public Incidencia asignarTecnico(Long incidenciaId, Long tecnicoId) {
        Incidencia incidencia = getIncidenciaById(incidenciaId);

        var tecnico = usuarioRepository.findById(tecnicoId)
            .orElseThrow(() -> new DomainRuleViolation("Técnico no encontrado"));

        incidencia.setTecnico(tecnico);
        return incidenciaRepository.save(incidencia);
    }
    public long contarPorEstado(Estado estado) {
        return incidenciaRepository.countByEstado(estado);
    }
    
    /*public Incidencia crearIncidencia(CrearIncidenciaRequest request, Long ciudadanoId) {

       if (usuario instanceof Ciudadano ciudadano) {

        
        Ubicacion ubicacion = new Ubicacion();
        ubicacion.setDireccion(request.getDireccion());
        ubicacion.setLatitud(request.getLatitud());
        ubicacion.setLongitud(request.getLongitud());
        ubicacionRepository.save(ubicacion);

        
        Incidencia incidencia = new Incidencia();
        incidencia.setDescripcion(request.getDescripcion());
        incidencia.setEstado(Estado.CREADA);
        incidencia.setPrioridad(request.getPrioridad() != null
                ? request.getPrioridad()
                : Prioridad.SIN_ASIGNAR);
        incidencia.setFechaCreacion(LocalDateTime.now());
        incidencia.setCiudadano(ciudadano);
        incidencia.setUbicacion(ubicacion);

        Incidencia guardada = incidenciaRepository.save(incidencia);

        
        registrarHistorial(guardada, Estado.CREADA, "Incidencia creada por ciudadano");

        return guardada;
        }
    }

    public Incidencia validarIncidencia(Long id, ValidarIncidenciaRequest request,
                                        Long operadorId) {

        Incidencia incidencia = obtenerPorId(id);

        // Solo se puede validar si está en estado CREADA
        if (incidencia.getEstado() != Estado.CREADA) {
            throw new EstadoInvalidoException(id, Estado.CREADA, incidencia.getEstado());
        }

        Operador operador = operadorRepository.findById(operadorId)
                .orElseThrow(() -> new UsuarioNotFoundException(operadorId));

        incidencia.setEstado(Estado.VALIDADA);
        incidencia.setPrioridad(request.getPrioridad());
        incidencia.setOperador(operador);

        Incidencia guardada = incidenciaRepository.save(incidencia);

        registrarHistorial(guardada, Estado.VALIDADA,
                "Validada por operador. Prioridad: " + request.getPrioridad());

        return guardada;
    }*/

}
