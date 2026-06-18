package dev.m4tt3o.mini_cs.repository;

import dev.m4tt3o.mini_cs.entity.WeaponTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WeaponTemplateRepository extends JpaRepository<WeaponTemplate, Long> {
    Optional<WeaponTemplate> findByName(String name);
}
