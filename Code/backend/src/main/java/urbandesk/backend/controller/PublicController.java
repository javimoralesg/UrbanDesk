package urbandesk.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicController {

    @GetMapping("/public/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Pong desde el backend de UrbanDesk!");
    }
}
