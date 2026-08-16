package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.dto.stats.EloHistoryPointDTO;
import dev.m4tt3o.minics.dto.stats.PlayerStatsSummaryDTO;
import dev.m4tt3o.minics.dto.stats.WeaponUsageStatDTO;
import dev.m4tt3o.minics.entity.EloHistory;
import dev.m4tt3o.minics.entity.Match;
import dev.m4tt3o.minics.entity.User;
import dev.m4tt3o.minics.entity.UserStatsSummary;
import dev.m4tt3o.minics.repository.*;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlayerStatsServiceImpl implements PlayerStatsService {

    private final UserStatsSummaryRepository summaryRepository;
    private final EloHistoryRepository eloHistoryRepository;
    private final MatchWeaponStatsRepository weaponStatsRepository;
    private final UserRepository userRepository;

    public PlayerStatsServiceImpl(
        UserStatsSummaryRepository summaryRepository,
        EloHistoryRepository eloHistoryRepository,
        MatchWeaponStatsRepository weaponStatsRepository,
        UserRepository userRepository
    ) {
        this.summaryRepository = summaryRepository;
        this.eloHistoryRepository = eloHistoryRepository;
        this.weaponStatsRepository = weaponStatsRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PlayerStatsSummaryDTO getUserStatsSummary(Long userId) {
        UserStatsSummary stats = summaryRepository.findById(userId).orElseGet(() -> createInitialSummary(userId));

        double winRate =
            stats.getMatchesPlayed() == 0 ? 0.0 : ((double) stats.getMatchesWon() / stats.getMatchesPlayed()) * 100.0;

        double kdRatio =
            stats.getTotalDeaths() == 0
                ? (double) stats.getTotalKills()
                : (double) stats.getTotalKills() / stats.getTotalDeaths();

        String favWeaponName =
            stats.getFavoriteWeaponTemplate() != null ? stats.getFavoriteWeaponTemplate().getName() : null;
        String favWeaponImage =
            stats.getFavoriteWeaponTemplate() != null ? stats.getFavoriteWeaponTemplate().getImageUrl() : null;

        return new PlayerStatsSummaryDTO(
            stats.getUserId(),
            stats.getMatchesPlayed(),
            stats.getMatchesWon(),
            stats.getMatchesLost(),
            stats.getMatchesDrawn(),
            Math.round(winRate * 100.0) / 100.0,
            stats.getTotalKills(),
            stats.getTotalDeaths(),
            Math.round(kdRatio * 100.0) / 100.0,
            stats.getTotalDamageDealt(),
            stats.getTotalDamageTaken(),
            stats.getTotalCritsLanded(),
            stats.getCasesOpened(),
            favWeaponName,
            favWeaponImage
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<EloHistoryPointDTO> getEloHistory(Long userId, Integer days, Integer limit) {
        if (days != null) {
            LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
            return eloHistoryRepository
                .findByUserIdAndRecordedAtAfterOrderByRecordedAtAsc(userId, cutoff)
                .stream()
                .map((e) ->
                    new EloHistoryPointDTO(
                        e.getId(),
                        e.getMatch() != null ? e.getMatch().getId() : null,
                        e.getEloBefore(),
                        e.getEloAfter(),
                        e.getEloChange(),
                        e.getRecordedAt()
                    )
                )
                .toList();
        }

        int maxResults = limit != null && limit > 0 ? limit : 30;
        return eloHistoryRepository
            .findByUserIdOrderByIdDesc(userId, PageRequest.of(0, maxResults))
            .stream()
            .map((e) ->
                new EloHistoryPointDTO(
                    e.getId(),
                    e.getMatch() != null ? e.getMatch().getId() : null,
                    e.getEloBefore(),
                    e.getEloAfter(),
                    e.getEloChange(),
                    e.getRecordedAt()
                )
            )
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WeaponUsageStatDTO> getTopWeapons(Long userId, Integer limit) {
        int maxResults = limit != null && limit > 0 ? limit : 5;
        return weaponStatsRepository.findTopWeaponsByUserId(userId, PageRequest.of(0, maxResults));
    }

    @Override
    @Transactional
    public void recordMatchStats(Match match) {
        if (match == null || match.getPlayerA() == null || match.getPlayerB() == null) {
            return;
        }

        // Process both players involved in the match
        updateStatsForPlayer(match.getPlayerA(), match);
        updateStatsForPlayer(match.getPlayerB(), match);
    }

    private void updateStatsForPlayer(User player, Match match) {
        UserStatsSummary stats = summaryRepository
            .findById(player.getId())
            .orElseGet(() -> createInitialSummary(player.getId()));

        stats.setMatchesPlayed(stats.getMatchesPlayed() + 1);

        boolean isWinner = match.getWinner() != null && match.getWinner().getId().equals(player.getId());
        boolean isDraw = match.getWinner() == null;

        if (isWinner) {
            stats.setMatchesWon(stats.getMatchesWon() + 1);
        } else if (isDraw) {
            stats.setMatchesDrawn(stats.getMatchesDrawn() + 1);
        } else {
            stats.setMatchesLost(stats.getMatchesLost() + 1);
        }

        stats.setUpdatedAt(LocalDateTime.now());
        summaryRepository.save(stats);
    }

    private UserStatsSummary createInitialSummary(Long userId) {
        User user = userRepository

            .findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        UserStatsSummary summary = new UserStatsSummary(user);

        // Using saveAndFlush guarantees Hibernate executes the insert immediately
        // and binds the @MapsId key to the persistence context before returning.
        return summaryRepository.saveAndFlush(summary);
    }
}
