package urbandesk.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.user.Usuario;
import urbandesk.backend.domain.tokens.Tokens;
import urbandesk.backend.domain.tokens.Tipo;
import urbandesk.backend.repository.TokensRepository;
import urbandesk.backend.repository.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TokensService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService MailService;
    private final TokensRepository tokensRepository;

    public String hashPassword(String password) {
        return passwordEncoder.encode(password);
    }

    public Boolean existeUsuarioConEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    private String generateCode() {
        return String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
    }

    private String generateToken() {
        return java.util.UUID.randomUUID().toString().replace("-", "");
    }

    private String hashToken(String token) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }

    public Usuario obtenerUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new DomainRuleViolation("Usuario no encontrado"));
    }

    public void recuperarCuenta(String email) {
        if (!existeUsuarioConEmail(email)) {
            throw new DomainRuleViolation("Usuario no encontrado");
        }
        Usuario usuario = obtenerUsuarioPorEmail(email);

        Optional<Tokens> tokens_old = tokensRepository.findByUsuarioAndTipo(usuario, Tipo.RECUPERACION);
        if (tokens_old.isPresent()) {
            tokensRepository.delete(tokens_old.get());
        }

        String token = generateCode();
        String tokenHash = hashToken(token);
        Tokens tokens = new Tokens(tokenHash, Tipo.RECUPERACION, LocalDateTime.now().plusMinutes(15), usuario);
        tokensRepository.save(tokens);
        MailService.enviarRecuperacion(usuario.getEmail(), usuario.getNombre(), token);
    }

    public void restablecerCuenta(String token, String password) {
        String tokenHash = hashToken(token);
        if (!tokensRepository.existsByTokenHash(tokenHash)) {
            throw new DomainRuleViolation("Token no encontrado");
        }
        Tokens tokens = tokensRepository.findByTokenHash(tokenHash).get();
        if (tokens.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new DomainRuleViolation("Token expirado");
        }
        if (tokens.getTipo() != Tipo.RECUPERACION) {
            throw new DomainRuleViolation("Token no es de tipo recuperacion");
        }
        Usuario usuario = tokens.getUsuario();
        usuario.setPasswordHash(hashPassword(password));
        usuarioRepository.save(usuario);
        tokensRepository.delete(tokens);
    }

    public void validarCorreo(String email) {
        if (!existeUsuarioConEmail(email)) {
            throw new DomainRuleViolation("Usuario no encontrado");
        }
        Usuario usuario = obtenerUsuarioPorEmail(email);

        Optional<Tokens> tokens_old = tokensRepository.findByUsuarioAndTipo(usuario, Tipo.VALIDACION);
        if (tokens_old.isPresent()) {
            tokensRepository.delete(tokens_old.get());
        }

        String token = generateToken();
        String tokenHash = hashToken(token);
        Tokens tokens = new Tokens(tokenHash, Tipo.VALIDACION, LocalDateTime.now().plusMinutes(30), usuario);
        tokensRepository.save(tokens);
        MailService.enviarValidacion(usuario.getEmail(), usuario.getNombre(), token);
    }

    public void validarCuenta(String token) {
        String tokenHash = hashToken(token);
        if (!tokensRepository.existsByTokenHash(tokenHash)) {
            throw new DomainRuleViolation("Token no encontrado");
        }
        Tokens tokens = tokensRepository.findByTokenHash(tokenHash).get();
        if (tokens.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new DomainRuleViolation("Token expirado");
        }
        if (tokens.getTipo() != Tipo.VALIDACION) {
            throw new DomainRuleViolation("Token no es de tipo validacion");
        }
        Usuario usuario = tokens.getUsuario();
        usuario.setValidado(true);
        usuarioRepository.save(usuario);
        tokensRepository.delete(tokens);
        MailService.enviarBienvenida(usuario.getEmail(), usuario.getNombre(), usuario.getEmail());
    }

}