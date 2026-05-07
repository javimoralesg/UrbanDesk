package urbandesk.backend.repository;

import urbandesk.backend.domain.tokens.Tokens;
import urbandesk.backend.domain.tokens.Tipo;
import urbandesk.backend.domain.user.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TokensRepository extends JpaRepository<Tokens, Long> {
    Optional<Tokens> findByTokenHash(String tokenHash);

    boolean existsByTokenHash(String tokenHash);

    Optional<Tokens> findById(Long id);

    Optional<Tokens> findByUsuarioAndTipo(Usuario usuario, Tipo tipo);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Tokens t WHERE t.fechaExpiracion < :now")
    void deleteExpiredTokens(java.time.LocalDateTime now);

}
