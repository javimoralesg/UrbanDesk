package urbandesk.backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.web.server.ResponseStatusException;

import urbandesk.backend.domain.DomainRuleViolation;
import urbandesk.backend.domain.incidence.Estado;
import urbandesk.backend.domain.incidence.Incidencia;
import urbandesk.backend.repository.IncidenciaRepository;
import urbandesk.backend.repository.OperadorRepository;
import urbandesk.backend.repository.UsuarioRepository;
import urbandesk.backend.service.IncidenciaService;
import urbandesk.backend.service.MailService;

@ExtendWith(MockitoExtension.class)
class IncidenciaServiceTest {

    @Mock
    private IncidenciaRepository incidenciaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private OperadorRepository operadorRepository;

    @Mock
    private MailService mailService;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private IncidenciaService incidenciaService;

    @Test
    void obtenerPorId_siExiste_devuelveIncidencia() {
        Incidencia incidencia = mock(Incidencia.class);

        when(incidencia.getId()).thenReturn(1L);
        when(incidenciaRepository.findById(1L))
                .thenReturn(Optional.of(incidencia));

        Incidencia resultado = incidenciaService.obtenerPorId(1L);

        assertEquals(1L, resultado.getId());
        verify(incidenciaRepository).findById(1L);
    }

    @Test
    void obtenerPorId_siNoExiste_lanzaExcepcion() {
        when(incidenciaRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            incidenciaService.obtenerPorId(99L);
        });

        verify(incidenciaRepository).findById(99L);
    }

    @Test
    void cerrarIncidencia_siNoEstaResuelta_lanzaDomainRuleViolation() {
        Incidencia incidencia = mock(Incidencia.class);

        when(incidencia.getEstado()).thenReturn(Estado.EN_CURSO);
        when(incidenciaRepository.findById(5L))
                .thenReturn(Optional.of(incidencia));

        assertThrows(DomainRuleViolation.class, () -> {
            incidenciaService.cerrarIncidencia(5L, "comentario");
        });

        verify(incidenciaRepository, never()).save(any());
    }
}