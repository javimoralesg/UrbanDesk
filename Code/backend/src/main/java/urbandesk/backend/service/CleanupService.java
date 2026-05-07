package urbandesk.backend.service;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import urbandesk.backend.repository.TokensRepository;
import urbandesk.backend.repository.UsuarioRepository;

@Service
@RequiredArgsConstructor
public class CleanupService {

    private final TokensRepository tokensRepository;
    private final UsuarioRepository usuarioRepository;

    @Scheduled(fixedDelay = 43200000)
    @Transactional
    public void cleanupExpiredTokensAndUnvalidatedUsers() {
        LocalDateTime now = LocalDateTime.now();
        
        tokensRepository.deleteExpiredTokens(now);

        usuarioRepository.deleteUnvalidatedUsersOlderThan(now.minusHours(12));
    }
}
