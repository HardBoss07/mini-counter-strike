package dev.m4tt3o.minics.repository;

import dev.m4tt3o.minics.entity.WeaponTemplate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WeaponTemplateRepository
    extends JpaRepository<WeaponTemplate, Long>
{
    Optional<WeaponTemplate> findByName(String name);
}
