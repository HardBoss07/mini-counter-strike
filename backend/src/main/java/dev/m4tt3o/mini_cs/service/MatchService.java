package dev.m4tt3o.mini_cs.service;

import dev.m4tt3o.mini_cs.dto.CombatRoundRecord;
import dev.m4tt3o.mini_cs.entity.Match;

/**
 * Service for managing matches.
 */
public interface MatchService {
    /**
     * Initializes a new match between two players.
     */
    Match createMatch(String playerAUsername, String playerBUsername);

    /**
     * Executes a turn in an existing match.
     */
    CombatRoundRecord executeTurn(Long matchId, Long playerId, Long actionId);
}
