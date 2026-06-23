package dev.m4tt3o.minics.repository;

import dev.m4tt3o.minics.entity.Loadout;
import dev.m4tt3o.minics.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoadoutRepository extends JpaRepository<Loadout, Long> {
    Optional<Loadout> findByUserAndSide(User user, String side);
    List<Loadout> findByUser_Id(Long userId);
}
