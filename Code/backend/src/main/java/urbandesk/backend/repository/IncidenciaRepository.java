package urbandesk.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import urbandesk.backend.domain.incidence.Estado;
import urbandesk.backend.domain.incidence.Incidencia;
import urbandesk.backend.domain.incidence.Prioridad;

import java.util.List;

@Repository
public interface IncidenciaRepository extends JpaRepository<Incidencia, Long> {
    List<Incidencia> findByCiudadanoId(Long ciudadanoId);

    List<Incidencia> findByEstado(Estado estado);

    List<Incidencia> findByPrioridad(Prioridad prioridad);
    
    List<Incidencia> findByOperadorId(Long operadorId);
    
    List<Incidencia> findByTecnicos_Id(Long tecnicoId);    
    long countByEstado(Estado estado);

}