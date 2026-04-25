package urbandesk.backend.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import urbandesk.backend.domain.incidence.Ubicacion;
import urbandesk.backend.domain.user.Especialidad;
import urbandesk.backend.repository.UsuarioRepository;
import urbandesk.backend.service.IncidenciaService;
import urbandesk.backend.service.UsuarioService;

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
        marcarIncidenciaComoValidada(1L, 2L);
        asignarIncidenciaATecnico(1L, 2L, 5L);
        aceptarIncidenciaPorTecnico(1L, 5L);
        marcarIncidenciaComoResuelta(1L, 5L);
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

    private void marcarIncidenciaComoValidada(Long incidenciaId, Long operadorId) {
        incidenciaService.validarIncidencia(
                incidenciaId,
                operadorId,
                "Incidencia validada (DataInitializer).",
                "URGENTE"
        );
    }

    private void asignarIncidenciaATecnico(Long incidenciaId, Long operadorId, Long tecnicoId) {
        incidenciaService.asignarTecnico(incidenciaId, tecnicoId);
    }

    private void aceptarIncidenciaPorTecnico(Long incidenciaId, Long tecnicoId) {
        incidenciaService.aceptarIncidenciaTecnico(incidenciaId, tecnicoId);
    }

    private void marcarIncidenciaComoResuelta(Long incidenciaId, Long tecnicoId) {
        incidenciaService.resolverIncidenciaTecnico(incidenciaId, tecnicoId, "Incidencia resuelta correctamente (DataInitializer).");
    }

    public void crearIncidencia(Long id) {
        Ubicacion ubicacion = new Ubicacion("Calle Falsa 123", 40.4168, -3.7038);
        String descripcion = "Farola rota en la calle";
        Long ciudadanoId = 1L; // ID del ciudadano previamente creado
        incidenciaService.crearIncidencia(ubicacion, descripcion, ciudadanoId, null);
    }

}
