package dev.m4tt3o.minics.repository;

import dev.m4tt3o.minics.entity.EloHistory;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EloHistoryRepository extends JpaRepository<EloHistory, Long> {
    // Fetch history after a specific date (e.g. last 30 days) ordered chronologically for graphs
    List<EloHistory> findByUserIdAndRecordedAtAfterOrderByRecordedAtAsc(Long userId, LocalDateTime cutoff);

    // Fetch latest N records (for match count pagination like last 15 matches)
    List<EloHistory> findByUserIdOrderByIdDesc(Long userId, Pageable pageable);
}
