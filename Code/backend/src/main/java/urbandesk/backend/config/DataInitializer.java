package urbandesk.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import jakarta.persistence.criteria.CriteriaBuilder.In;
import urbandesk.backend.domain.user.Especialidad;
import urbandesk.backend.repository.UsuarioRepository;
import urbandesk.backend.service.UsuarioService;
import urbandesk.backend.service.IncidenciaService;
import urbandesk.backend.domain.incidence.Ubicacion;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final IncidenciaService incidenciaService;

    @Override
    public void run(ApplicationArguments args) {
        crearCiudadano();
        crearOperador("operador1@urbandesk.com", 7);
        crearOperador("operador2@urbandesk.com", 10);
        crearOperador("operador3@urbandesk.com", 5);
        crearTecnicoElectricista();
        crearTecnicoFontanero();
        crearTecnicoJardinero();
        crearTecnicoAlbanil();
        crearTecnicoPintor();
        crearIncidencia(1L);
        crearIncidencia(2L);
        crearIncidencia(3L);
    }

    private void crearCiudadano() {
        String email = "ciudadano@urbandesk.com";
        if (usuarioRepository.findByEmail(email).isEmpty()) {
            usuarioService.registrarCiudadano("ciudadano", email, "ciudadano", "12345");
        }
    }

    private void crearOperador(String email, int cargaInicialForzada) {
        if (usuarioRepository.findByEmail(email).isEmpty()) {
            usuarioService.registrarOperador("Operador", email, "operador", cargaInicialForzada);
        }
    }

    private void crearTecnicoElectricista() {
        String email = "electricista@urbandesk.com";
        if (usuarioRepository.findByEmail(email).isEmpty()) {
            usuarioService.registrarTecnico("Electricista", email, "electricista", Especialidad.ELECTRICISTA);
        }
    }

    private void crearTecnicoFontanero() {
        String email = "fontanero@urbandesk.com";
        if (usuarioRepository.findByEmail(email).isEmpty()) {
            usuarioService.registrarTecnico("Fontanero", email, "fontanero", Especialidad.FONTANERO);
        }
    }

    private void crearTecnicoJardinero() {
        String email = "jardinero@urbandesk.com";
        if (usuarioRepository.findByEmail(email).isEmpty()) {
            usuarioService.registrarTecnico("Jardinero", email, "jardinero", Especialidad.JARDINERO);
        }
    }

    private void crearTecnicoAlbanil() {
        String email = "albanil@urbandesk.com";
        if (usuarioRepository.findByEmail(email).isEmpty()) {
            usuarioService.registrarTecnico("Albañil", email, "albanil", Especialidad.ALBAÑIL);
        }
    }

    private void crearTecnicoPintor() {
        String email = "pintor@urbandesk.com";
        if (usuarioRepository.findByEmail(email).isEmpty()) {
            usuarioService.registrarTecnico("Pintor", email, "pintor", Especialidad.PINTOR);
        }
    }

    public void crearIncidencia(Long id) {
        Ubicacion ubicacion = new Ubicacion("Calle Falsa 123", 40.4168, -3.7038);
        String descripcion = "Farola rota en la calle";
        Long ciudadanoId = 1L; // ID del ciudadano previamente creado
        incidenciaService.crearIncidencia(ubicacion, descripcion, ciudadanoId, null);
    }

}
