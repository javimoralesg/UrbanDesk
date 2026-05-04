package urbandesk.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class InformeController {

    private final JdbcTemplate jdbcTemplate;

    @Value("${APIKEY_INCIDENCIA}")
    private String expectedToken;

    public InformeController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PutMapping("/api/informe")
    public ResponseEntity<?> executeQuery(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> payload) {
        
        String expectedAuth = "Bearer " + expectedToken;
        
        if (authHeader == null || !authHeader.equals(expectedAuth)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Acceso denegado");
        }

        String sqlQuery = payload.get("query");
        if (sqlQuery == null || sqlQuery.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Consulta SQL vacía o no proporcionada");
        }

        try {
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sqlQuery);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al ejecutar la consulta: " + e.getMessage());
        }
    }
}
