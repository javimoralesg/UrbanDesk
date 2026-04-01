package urbandesk.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.CriteriaBuilder.In;
import lombok.RequiredArgsConstructor;
import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.incidence.Estado;
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

    public List<Incidencia> obtenerTodas() {
        return incidenciaRepository.findAll();
    }

    public Incidencia obtenerPorId(Long id) {
        return incidenciaRepository.findById(id)
                .orElseThrow(() -> new DomainRuleViolation("Incidencia no encontrada"));
    }

    public List<Incidencia> obtenerPorEstado(Estado estado) {
        return incidenciaRepository.findByEstado(estado);
    }

    public List<Incidencia> obtenerPorCiudadano(Long ciudadanoId) {
        return incidenciaRepository.findByCiudadanoId(ciudadanoId);
    }

    public List<Incidencia> obtenerPorPrioridad(Prioridad prioridad) {
        return incidenciaRepository.findByPrioridad(prioridad);
    }

    public List<Incidencia> obtenerPorTecnico(Long tecnicoId) {
        return incidenciaRepository.findByTecnicos_Id(tecnicoId);
    }

    public Incidencia crearIncidencia(Ubicacion ubicacion, String descripcion, Long ciudadanoId) {
        Usuario usuario = usuarioRepository.findById(ciudadanoId)
                .orElseThrow(() -> new DomainRuleViolation("Ciudadano no encontrado"));

        if (!(usuario instanceof Ciudadano ciudadano)) {
            throw new DomainRuleViolation("El usuario indicado no es un ciudadano");
        }

        Incidencia incidencia = new Incidencia(ubicacion, descripcion, ciudadano);
        Incidencia incidenciaGuardada = incidenciaRepository.save(incidencia);
        MailService.enviarIncidenciaCreada(ciudadano.getEmail(), incidenciaGuardada.getId(), ciudadano.getNombre());
        return incidenciaGuardada;
    }

    public Incidencia actualizarIncidencia(Long id, Ubicacion nuevaUbicacion, String nuevaDescripcion) {
        Incidencia incidencia = obtenerPorId(id);
        incidencia.modificarIncidencia(nuevaUbicacion, nuevaDescripcion);
        return incidenciaRepository.save(incidencia);
    }

    public Incidencia cambiarEstado(Long id, Estado nuevoEstado) {
        Incidencia incidencia = obtenerPorId(id);
        incidencia.actualizarEstado(nuevoEstado);
        Incidencia incidenciaGuardada = incidenciaRepository.save(incidencia);
        MailService.enviarCambioEstado(incidencia.getCiudadano().getEmail(), incidencia.getId(), incidencia.getDescripcion(), nuevoEstado);
        return incidenciaGuardada;
    }

    public Incidencia asignarOperador(Long incidenciaId, Long operadorId) {
        Incidencia incidencia = obtenerPorId(incidenciaId);

        Usuario usuario = usuarioRepository.findById(operadorId)
                .orElseThrow(() -> new DomainRuleViolation("Usuario no encontrado"));

        if (!(usuario instanceof Operador)) {
            throw new DomainRuleViolation("El usuario no es un operador");
        }

        Operador operador = (Operador) usuario;
        incidencia.asignarOperador(operador);
        return incidenciaRepository.save(incidencia);
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

    public Incidencia cambiarPrioridad(Long id, Prioridad prioridad) {
        Incidencia incidencia = obtenerPorId(id);
        incidencia.asignarPrioridad(prioridad);
        return incidenciaRepository.save(incidencia);
    }

    public void eliminarIncidencia(Long id) {
        Incidencia incidencia = obtenerPorId(id);
        incidenciaRepository.delete(incidencia);
    }

    public long contarPorEstado(Estado estado) {
        return incidenciaRepository.countByEstado(estado);
    }
}


