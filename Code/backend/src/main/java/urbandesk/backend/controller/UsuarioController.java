package urbandesk.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import urbandesk.backend.domain.user.Ciudadano;
import urbandesk.backend.domain.user.Usuario;
import urbandesk.backend.service.UsuarioService;

import java.util.Map;


@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {
    private final UsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrar(@RequestBody Map<String, String> body) {
        String nombre = body.get("nombre");
        String email = body.get("email");
        String password = body.get("passwordHash");
        String codigoPostal = body.get("codigoPostal");

        Usuario usuario = usuarioService.registrarCiudadano(
            nombre, email, password, codigoPostal
        );

        return ResponseEntity.ok(usuario);
    }
}
