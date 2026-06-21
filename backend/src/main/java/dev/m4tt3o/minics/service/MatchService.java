package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.dto.CombatRoundRecord;
import dev.m4tt3o.minics.dto.match.MatchStateResponse;
import dev.m4tt3o.minics.entity.Match;
import org.springframework.stereotype.Service;

import java.util.List;

public interface MatchService {
    Match createMatch(String playerAUsername, String playerBUsername);
    CombatRoundRecord executeTurn(Long matchId, Long playerId, Long actionId);
    Long queueMatch(String username);
    String getQueueStatus(Long ticketId);
    MatchStateResponse getMatchState(Long matchId);
    void submitAction(Long matchId, String username, Long weaponId);
    List<CombatRoundRecord> getMatchLogs(Long matchId);
    void simulateAndSaveMatch(Match match);
}
