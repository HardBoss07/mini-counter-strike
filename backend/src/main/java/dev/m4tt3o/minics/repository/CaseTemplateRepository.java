package dev.m4tt3o.minics.repository;

import dev.m4tt3o.minics.entity.CaseTemplate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaseTemplateRepository extends JpaRepository<CaseTemplate, Long> {
    Optional<CaseTemplate> findFirstByOrderByIdAsc();
}
