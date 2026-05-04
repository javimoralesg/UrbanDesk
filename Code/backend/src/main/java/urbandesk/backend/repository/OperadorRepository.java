package urbandesk.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import urbandesk.backend.domain.user.Operador;

import java.util.List;

@Repository
public interface OperadorRepository extends JpaRepository<Operador, Long> {

    List<Operador> findByCargaActualLessThanOrderByCargaActualAsc(int cargaMaxima);
}

