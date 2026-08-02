package dev.m4tt3o.minics.repository;

import dev.m4tt3o.minics.entity.User;
import dev.m4tt3o.minics.entity.UserCaseInstance;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserCaseInstanceRepository
    extends JpaRepository<UserCaseInstance, Long>
{
    List<UserCaseInstance> findByUserId(Long userId);
    List<UserCaseInstance> findByUserIdAndOpenedFalse(Long userId);
    long countByUserId(Long userId);
    long countByUserAndOpenedFalse(User user);
}
