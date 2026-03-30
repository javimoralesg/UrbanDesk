package urbandesk.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import urbandesk.backend.domain.user.Especialidad;
import urbandesk.backend.repository.UsuarioRepository;
import urbandesk.backend.service.UsuarioService;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;

    @Override
    public void run(ApplicationArguments args) {
        crearOperador();
        crearTecnicoElectricista();
        crearTecnicoFontanero();
        crearTecnicoJardinero();
        crearTecnicoAlbanil();
        crearTecnicoPintor();
    }


    private void crearOperador() {
        String email = "operador@urbandesk.com";
        if (usuarioRepository.findByEmail(email).isEmpty()) {
            // usuarioService.registrarOperador("Operador", email, "operador");
        }
    }


    private void crearTecnicoElectricista() {
        String email = "electricista@urbandesk.com";
        if (usuarioRepository.findByEmail(email).isEmpty()) {
            // usuarioService.registrarTecnico("Electricista", email, "electricista", Especialidad.ELECTRICISTA);
        }
    }

    private void crearTecnicoFontanero() {
        String email = "fontanero@urbandesk.com";
        if (usuarioRepository.findByEmail(email).isEmpty()) {
            // usuarioService.registrarTecnico("Fontanero", email, "fontanero", Especialidad.FONTANERO);
        }
    }

    private void crearTecnicoJardinero() {
        String email = "jardinero@urbandesk.com";
        if (usuarioRepository.findByEmail(email).isEmpty()) {
            // usuarioService.registrarTecnico("Jardinero", email, "jardinero", Especialidad.JARDINERO);
        }
    }

    private void crearTecnicoAlbanil() {
        String email = "albanil@urbandesk.com";
        if (usuarioRepository.findByEmail(email).isEmpty()) {
            // usuarioService.registrarTecnico("Albañil", email, "albanil", Especialidad.ALBAÑIL);
        }
    }

    private void crearTecnicoPintor() {
        String email = "pintor@urbandesk.com";
        if (usuarioRepository.findByEmail(email).isEmpty()) {
            // usuarioService.registrarTecnico("Pintor", email, "pintor", Especialidad.PINTOR);
        }
    }

}
