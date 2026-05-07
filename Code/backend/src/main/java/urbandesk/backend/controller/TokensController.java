package urbandesk.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.service.TokensService;

@RestController
@RequestMapping("/api/tokens")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173" })
public class TokensController {

    private final TokensService tokensService;

    @PostMapping("/recuperar-cuenta")
    public ResponseEntity<?> recuperarCuenta(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(400).body(Map.of("error", "El email es obligatorio"));
            }
            tokensService.recuperarCuenta(email);
            return ResponseEntity.ok(Map.of("message",
                    "Se ha enviado un correo electrónico con instrucciones para restablecer la contraseña"));
        } catch (DomainRuleViolation e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al recuperar la contraseña"));
        }
    }

    @PostMapping("/restablecer-cuenta")
    public ResponseEntity<?> restablecerCuenta(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String password = request.get("password");
            if (token == null || token.isBlank()) {
                return ResponseEntity.status(400).body(Map.of("error", "El token es obligatorio"));
            }
            if (password == null || password.isBlank()) {
                return ResponseEntity.status(400).body(Map.of("error", "La contraseña es obligatoria"));
            }
            tokensService.restablecerCuenta(token, password);
            return ResponseEntity.ok(Map.of("message", "Cuenta restablecida correctamente"));
        } catch (DomainRuleViolation e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al restablecer la cuenta"));
        }
    }

    @PostMapping("/validar-cuenta")
    public ResponseEntity<?> validarCuenta(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            if (token == null || token.isBlank()) {
                return ResponseEntity.status(400).body(Map.of("error", "El token es obligatorio"));
            }
            tokensService.validarCuenta(token);
            return ResponseEntity.ok(Map.of("message", "Cuenta validada correctamente"));
        } catch (DomainRuleViolation e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al validar la cuenta"));
        }
    }

}