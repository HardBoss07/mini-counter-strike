package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.dto.stats.EloHistoryPointDTO;
import dev.m4tt3o.minics.dto.stats.PlayerStatsSummaryDTO;
import dev.m4tt3o.minics.dto.stats.WeaponUsageStatDTO;
import dev.m4tt3o.minics.entity.Match;
import java.util.List;

public interface PlayerStatsService {
    PlayerStatsSummaryDTO getUserStatsSummary(Long userId);
    List<EloHistoryPointDTO> getEloHistory(Long userId, Integer days, Integer limit);
    List<WeaponUsageStatDTO> getTopWeapons(Long userId, Integer limit);
    void recordMatchStats(Match match);
}
