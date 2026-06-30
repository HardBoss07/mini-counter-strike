package dev.m4tt3o.minics.controller;

import dev.m4tt3o.minics.dto.CombatRoundRecord;
import dev.m4tt3o.minics.dto.match.MatchStateResponse;
import dev.m4tt3o.minics.entity.User;
import dev.m4tt3o.minics.repository.UserRepository;
import dev.m4tt3o.minics.service.MatchService;
import dev.m4tt3o.minics.service.MatchmakingService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/match")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;
    private final MatchmakingService matchmakingService;
    private final UserRepository userRepository;

    @PostMapping("/queue")
    public ResponseEntity<Map<String, Long>> queue() {
        String username = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Long ticketId = matchmakingService.queueUser(user.getId());
        matchmakingService.tryMatchmaking(); // Attempt to match immediately
        return ResponseEntity.ok(Map.of("ticketId", ticketId));
    }

    @GetMapping(
        value = "/{matchId}/stream",
        produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter streamMatchState(@PathVariable Long matchId) {
        return matchService.subscribeToMatch(matchId);
    }

    @GetMapping("/queue/status")
    public ResponseEntity<Map<String, Object>> queueStatus(
        @RequestParam Long ticketId
    ) {
        String status = matchmakingService.getStatus(ticketId);
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("status", status);
        if ("MATCH_FOUND".equals(status)) {
            response.put("matchId", matchmakingService.getMatchId(ticketId));
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{matchId}/state")
    public ResponseEntity<MatchStateResponse> state(
        @PathVariable Long matchId
    ) {
        return ResponseEntity.ok(matchService.getMatchState(matchId));
    }

    @PostMapping("/{matchId}/action")
    public ResponseEntity<Void> action(
        @PathVariable Long matchId,
        @RequestBody Map<String, Long> request
    ) {
        String username = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
        matchService.submitAction(matchId, username, request.get("weaponId"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{matchId}/surrender")
    public ResponseEntity<Void> surrender(@PathVariable Long matchId) {
        String username = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
        matchService.surrenderMatch(matchId, username);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{matchId}/logs")
    public ResponseEntity<List<CombatRoundRecord>> logs(
        @PathVariable Long matchId
    ) {
        return ResponseEntity.ok(matchService.getMatchLogs(matchId));
    }

    @PostMapping("/queue/leave")
    public ResponseEntity<Void> leaveQueue() {
        String username = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        matchmakingService.leaveQueue(user.getId());
        return ResponseEntity.ok().build();
    }

    /**
     * Local Controller Exception Handler Shield.
     * Intercepts unhandled tactical rule calculation breakdowns from MatchEngine
     * and reports them as clean bad requests instead of defaulting to a 403 Forbidden.
     */
    @ExceptionHandler({
        RuntimeException.class,
        IllegalArgumentException.class,
        IllegalStateException.class,
    })
    public ResponseEntity<Map<String, String>> handleMatchEngineExceptions(
        Exception ex
    ) {
        return ResponseEntity.badRequest().body(
            Map.of("message", ex.getMessage())
        );
    }
}
