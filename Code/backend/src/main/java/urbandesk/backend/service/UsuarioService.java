package urbandesk.backend.service;

import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.user.Ciudadano;
import urbandesk.backend.domain.user.Usuario;
import urbandesk.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService MailService;

    public void eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new NoSuchElementException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }

    public List<Usuario> obtenerUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new DomainRuleViolation("Usuario no encontrado"));
    }

    public Usuario obtenerUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new DomainRuleViolation("Usuario no encontrado"));
    }

    public Usuario registrarCiudadano(String nombre, String email, String password, String codigoPostal) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new DomainRuleViolation("El email ya está registrado");
        }

        Ciudadano ciudadano = new Ciudadano(nombre, email, hashPassword(password), codigoPostal);

        Usuario usuarioGuardado = usuarioRepository.save(ciudadano);
        MailService.enviarBienvenida(ciudadano.getEmail(), ciudadano.getNombre(), ciudadano.getEmail());
        return usuarioGuardado;
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
                if (!email.equals(usuario.getEmail()) && usuarioRepository.existsByEmail(email)) {
                    throw new DomainRuleViolation("El email ya está registrado");
                }
                usuario.actualizarDatosPersonales(ciudadano.getNombre(), email);
            }
            if (codigoPostal != null && !codigoPostal.isBlank()) {
                ciudadano.actualizarCodigoPostal(codigoPostal);
            }
        }
        return usuarioRepository.save(usuario);
    }

}
