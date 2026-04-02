package urbandesk.backend.service;

import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.user.Ciudadano;
import urbandesk.backend.domain.user.Especialidad;
import urbandesk.backend.domain.user.Operador;
import urbandesk.backend.domain.user.Tecnico;
import urbandesk.backend.domain.user.Usuario;
import urbandesk.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService MailService;

    public void eliminar(Long id) {
        Usuario usuario = obtenerUsuarioPorId(id);
        usuarioRepository.delete(usuario);
    }

    public Boolean existeUsuarioConEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    public Usuario obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new DomainRuleViolation("Usuario no encontrado"));
    }

    public Usuario obtenerUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new DomainRuleViolation("Usuario no encontrado"));
    }

    public Ciudadano registrarCiudadano(String nombre, String email, String password, String codigoPostal) {
        if (existeUsuarioConEmail(email)) {
            throw new DomainRuleViolation("El email ya está registrado");
        }

        Ciudadano ciudadano = new Ciudadano(nombre, email, hashPassword(password), codigoPostal);

        Ciudadano ciudadanoGuardado = usuarioRepository.save(ciudadano);
        MailService.enviarBienvenida(ciudadano.getEmail(), ciudadano.getNombre(), ciudadano.getEmail());
        return ciudadanoGuardado;
    }

    public Operador registrarOperador(String nombre, String email, String password, int cargaInicialForzada) {
        if (existeUsuarioConEmail(email)) {
            throw new DomainRuleViolation("El email ya está registrado");
        }

        Operador operador = new Operador(nombre, email, hashPassword(password));
        operador.forzarCarga(cargaInicialForzada);
        Operador operadorGuardado = usuarioRepository.save(operador);
        return operadorGuardado;
    }

    public Tecnico registrarTecnico(String nombre, String email, String password, Especialidad especialidad) {
        if (existeUsuarioConEmail(email)) {
            throw new DomainRuleViolation("El email ya está registrado");
        }

        Tecnico tecnico = new Tecnico(nombre, email, hashPassword(password), especialidad);
        Tecnico tecnicoGuardado = usuarioRepository.save(tecnico);
        return tecnicoGuardado;
    }

    public String hashPassword(String password) {
        return passwordEncoder.encode(password);
    }

    public Usuario modificarPerfil(Long id, String nombre, String email, String password, String codigoPostal) {
        Usuario usuario = obtenerUsuarioPorId(id);

        if (password != null && !password.isBlank()) {
            usuario.actualizarPassword(hashPassword(password));
        }
        if (usuario instanceof Ciudadano ciudadano) {
            if (nombre != null && !nombre.isBlank()) {
                ciudadano.actualizarDatosPersonales(nombre, ciudadano.getEmail());
            }
            if (email != null && !email.isBlank()) {
                if (!email.equals(usuario.getEmail()) && existeUsuarioConEmail(email)) {
                    throw new DomainRuleViolation("El email ya está registrado");
                }
                ciudadano.actualizarDatosPersonales(ciudadano.getNombre(), email);
            }
            if (codigoPostal != null && !codigoPostal.isBlank()) {
                ciudadano.actualizarCodigoPostal(codigoPostal);
            }
        }
        return usuarioRepository.save(usuario);
    }

}
