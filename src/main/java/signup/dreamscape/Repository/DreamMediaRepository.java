package signup.dreamscape.Repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import signup.dreamscape.Entity.DreamMediaEntity;

@Repository
public interface DreamMediaRepository extends JpaRepository<DreamMediaEntity,Long> { //<엔티티타입, PK타입>
}
