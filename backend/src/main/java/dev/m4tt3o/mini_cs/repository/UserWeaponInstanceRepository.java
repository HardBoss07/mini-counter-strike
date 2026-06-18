package dev.m4tt3o.mini_cs.repository;

import dev.m4tt3o.mini_cs.entity.UserWeaponInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserWeaponInstanceRepository extends JpaRepository<UserWeaponInstance, Long> {}
