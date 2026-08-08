package dev.m4tt3o.minics.repository;

import dev.m4tt3o.minics.entity.MatchPlayerStats;
import dev.m4tt3o.minics.entity.MatchPlayerStatsId;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchPlayerStatsRepository extends JpaRepository<MatchPlayerStats, MatchPlayerStatsId> {
    List<MatchPlayerStats> findByUserIdOrderByMatchIdDesc(Long userId, Pageable pageable);

    List<MatchPlayerStats> findByMatchId(Long matchId);
}
