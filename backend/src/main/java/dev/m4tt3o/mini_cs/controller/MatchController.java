package dev.m4tt3o.mini_cs.controller;

import dev.m4tt3o.mini_cs.dto.CombatRoundRecord;
import dev.m4tt3o.mini_cs.entity.Match;
import dev.m4tt3o.mini_cs.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for match operations.
 */
@RestController
@RequestMapping("/api/match")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    /**
     * Initializes a match between two players.
     */
    @PostMapping("/queue")
    public ResponseEntity<?> queueMatch(@RequestBody Map<String, String> request) {
        String playerA = request.get("playerA");
        String playerB = request.get("playerB");
        return ResponseEntity.ok(matchService.createMatch(playerA, playerB));
    }

    /**
     * Submits a turn for a player and returns the result.
     */
    @PostMapping("/{matchId}/turn")
    public ResponseEntity<CombatRoundRecord> submitTurn(
            @PathVariable Long matchId,
            @RequestBody Map<String, Long> request) {
        Long playerId = request.get("playerId");
        Long actionId = request.get("actionId");
        return ResponseEntity.ok(matchService.executeTurn(matchId, playerId, actionId));
    }
}
