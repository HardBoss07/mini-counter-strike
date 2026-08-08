package dev.m4tt3o.minics.repository;

import dev.m4tt3o.minics.dto.stats.WeaponUsageStatDTO;
import dev.m4tt3o.minics.entity.MatchWeaponStats;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchWeaponStatsRepository extends JpaRepository<MatchWeaponStats, Long> {
    @Query(
        """
            SELECT new dev.m4tt3o.minics.dto.stats.WeaponUsageStatDTO(
                wt.id,
                wt.name,
                wt.imageUrl,
                SUM(mws.timesUsed),
                SUM(mws.damageDealt),
                SUM(mws.kills),
                SUM(mws.critsLanded)
            )
            FROM MatchWeaponStats mws
            JOIN mws.template wt
            WHERE mws.user.id = :userId
            GROUP BY wt.id, wt.name, wt.imageUrl
            ORDER BY SUM(mws.timesUsed) DESC
        """
    )
    List<WeaponUsageStatDTO> findTopWeaponsByUserId(@Param("userId") Long userId, Pageable pageable);
}
