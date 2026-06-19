package dev.m4tt3o.mini_cs.repository;

import dev.m4tt3o.mini_cs.entity.Loadout;
import dev.m4tt3o.mini_cs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface LoadoutRepository extends JpaRepository<Loadout, Long> {
    Optional<Loadout> findByUserAndSide(User user, String side);
    List<Loadout> findByUser_Id(Long userId);
}
