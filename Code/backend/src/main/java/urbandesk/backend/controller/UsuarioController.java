package urbandesk.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import urbandesk.backend.domain.user.Ciudadano;
import urbandesk.backend.domain.user.Especialidad;
import urbandesk.backend.domain.user.Usuario;
import urbandesk.backend.service.UsuarioService;

import java.util.Map;


@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public record UsuarioRequest(
        String nombre,
        String email,
        String password,
        String codigoPostal) {
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody UsuarioRequest request) {

        if (usuarioService.existeUsuarioConEmail(request.email())) {
            return ResponseEntity.status(400).body(java.util.Map.of("error", "El email ya está registrado"));
        }

        Ciudadano ciudadano = usuarioService.registrarCiudadano(
            request.nombre(),
            request.email(), 
            request.password(), 
            request.codigoPostal()
        );

        return ResponseEntity.ok(ciudadano);
    }
}
