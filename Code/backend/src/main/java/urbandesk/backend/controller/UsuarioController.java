package urbandesk.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.user.Ciudadano;
import urbandesk.backend.domain.user.Usuario;
import urbandesk.backend.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"})
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuthenticationManager authenticationManager;

    public record UsuarioRequest(
        String nombre,
        String email,
        String password,
        String codigoPostal
    ) {}

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody UsuarioRequest request) {

        if (usuarioService.existeUsuarioConEmail(request.email())) {
            return ResponseEntity.status(400).body(Map.of("error", "El email ya está registrado"));
        }

        Ciudadano ciudadano = usuarioService.registrarCiudadano(
            request.nombre(),
            request.email(),
            request.password(),
            request.codigoPostal()
        );

        return ResponseEntity.ok(ciudadano);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UsuarioRequest request) {
        try {
            Usuario usuario;
            try {
                usuario = usuarioService.obtenerUsuarioPorEmail(request.email());
            } catch (DomainRuleViolation e) {
                return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
            }

            if (!usuario.isValidado()) {
                return ResponseEntity.status(403).body(Map.of("error", "Cuenta no validada. Por favor, revisa tu correo electrónico para validarla."));
            }

            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            return ResponseEntity.ok(usuario);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
        }
    }

    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerPerfil(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
            }

            Usuario usuario = usuarioService.obtenerUsuarioPorEmail(authentication.getName());
            return ResponseEntity.ok(usuario);

        } catch (DomainRuleViolation e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/perfil")
    public ResponseEntity<?> actualizarPerfil(@RequestBody UsuarioRequest request, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
            }

            String emailActual = authentication.getName();

            Usuario usuarioActualizado = usuarioService.modificarPerfilPorEmailAutenticado(
                emailActual,
                request.nombre(),
                request.email(),
                request.password(),
                request.codigoPostal()
            );

            return ResponseEntity.ok(usuarioActualizado);

        } catch (DomainRuleViolation e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al actualizar el perfil"));
        }
    }

    @DeleteMapping("/perfil")
    public ResponseEntity<?> eliminarCuenta(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
            }

            String email = authentication.getName();
            usuarioService.eliminarUsuario(email);

            return ResponseEntity.ok(Map.of("message", "Cuenta eliminada correctamente"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al eliminar la cuenta"));
        }
    }
}