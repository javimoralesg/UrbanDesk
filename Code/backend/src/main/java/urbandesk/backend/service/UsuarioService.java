package urbandesk.backend.service;

import urbandesk.backend.dto.UsuarioRequestDTO;
import urbandesk.backend.dto.UsuarioResponseDTO;
import urbandesk.backend.model.Usuario;
import urbandesk.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioResponseDTO crear(UsuarioRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        Usuario usuario = Usuario.builder()
                .email(dto.getEmail())
                .password(hashearPassword(dto.getPassword()))
                .build();

        return toResponseDTO(usuarioRepository.save(usuario));
    }

    public UsuarioResponseDTO buscarPorId(Integer id) {
        return usuarioRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));
    }

    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public void eliminar(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new NoSuchElementException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }

    private String hashearPassword(String raw) {
        if (raw == null || raw.isBlank()) return null;
        return passwordEncoder.encode(raw);
    }

    private UsuarioResponseDTO toResponseDTO(Usuario u) {
        return UsuarioResponseDTO.builder()
                .id(u.getId())
                .email(u.getEmail())
                .build();
    }
}
