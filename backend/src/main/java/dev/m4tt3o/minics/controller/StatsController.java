package dev.m4tt3o.minics.controller;

import dev.m4tt3o.minics.dto.stats.EloHistoryPointDTO;
import dev.m4tt3o.minics.dto.stats.PlayerStatsSummaryDTO;
import dev.m4tt3o.minics.dto.stats.WeaponUsageStatDTO;
import dev.m4tt3o.minics.service.PlayerStatsService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final PlayerStatsService statsService;

    public StatsController(PlayerStatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<PlayerStatsSummaryDTO> getUserSummary(@PathVariable Long userId) {
        return ResponseEntity.ok(statsService.getUserStatsSummary(userId));
    }

    @GetMapping("/user/{userId}/elo-history")
    public ResponseEntity<List<EloHistoryPointDTO>> getEloHistory(
        @PathVariable Long userId,
        @RequestParam(required = false) Integer days,
        @RequestParam(required = false) Integer limit
    ) {
        return ResponseEntity.ok(statsService.getEloHistory(userId, days, limit));
    }

    @GetMapping("/user/{userId}/top-weapons")
    public ResponseEntity<List<WeaponUsageStatDTO>> getTopWeapons(
        @PathVariable Long userId,
        @RequestParam(required = false, defaultValue = "5") Integer limit
    ) {
        return ResponseEntity.ok(statsService.getTopWeapons(userId, limit));
    }
}
