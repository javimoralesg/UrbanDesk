package urbandesk.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import urbandesk.backend.service.MailService;


@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestController {

    private final MailService mailService;

    @GetMapping("/email")
    public ResponseEntity<String> testEmail(@RequestParam String destinatario,
                                             @RequestParam String nombre,
                                             @RequestParam String email) {
        mailService.enviarBienvenida(destinatario, nombre, email);
        return ResponseEntity.ok("Email enviado correctamente a: " + destinatario);
    }
}
