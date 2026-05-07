package urbandesk.backend.repository;

import urbandesk.backend.domain.user.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long>{
    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<Usuario> findById(Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Usuario u WHERE u.validado = false AND u.fechaCreacion < :threshold")
    void deleteUnvalidatedUsersOlderThan(java.time.LocalDateTime threshold);
    
} 

