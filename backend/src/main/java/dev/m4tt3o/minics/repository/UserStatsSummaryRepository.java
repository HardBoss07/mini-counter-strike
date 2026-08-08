package dev.m4tt3o.minics.repository;

import dev.m4tt3o.minics.entity.UserStatsSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserStatsSummaryRepository extends JpaRepository<UserStatsSummary, Long> {}
