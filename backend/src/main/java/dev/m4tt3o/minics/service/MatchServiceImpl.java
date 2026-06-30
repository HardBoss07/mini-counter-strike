package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.config.GameConfig;
import dev.m4tt3o.minics.dto.*;
import dev.m4tt3o.minics.dto.match.LiveMatchState;
import dev.m4tt3o.minics.dto.match.MatchStateResponse;
import dev.m4tt3o.minics.engine.MatchEngine;
import dev.m4tt3o.minics.entity.*;
import dev.m4tt3o.minics.repository.*;
import dev.m4tt3o.minics.service.combat.CombatRoundProcessor;
import dev.m4tt3o.minics.service.mapper.LoadoutArchetypeMapper;
import dev.m4tt3o.minics.service.mapper.MatchStateMapper;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final LoadoutRepository loadoutRepository;
    private final MatchEngine matchEngine;
    private final GameConfig gameConfig;
    private final MatchStateMapper matchStateMapper;
    private final CombatRoundProcessor combatRoundProcessor;
    private final ConcurrentHashMap<Long, Map<String, SseEmitter>> emitters =
        new ConcurrentHashMap<>();

    @Override
    @Transactional
    public Match createMatch(String playerAUsername, String playerBUsername) {
        User playerA = userRepository
            .findByUsername(playerAUsername)
            .orElseThrow(() -> new RuntimeException("Player A not found"));
        User playerB = userRepository
            .findByUsername(playerBUsername)
            .orElseThrow(() -> new RuntimeException("Player B not found"));

        Match match = new Match();
        match.setPlayerA(playerA);
        match.setPlayerB(playerB);
        match.setStatus("IN_PROGRESS");

        boolean playerAIsT = new java.security.SecureRandom().nextBoolean();

        Loadout loadoutA = resolveLoadout(
            playerA,
            playerAIsT ? "T" : "CT",
            playerAUsername
        );
        Loadout loadoutB = resolveLoadout(
            playerB,
            !playerAIsT ? "T" : "CT",
            playerBUsername
        );

        List<WeaponArchetype> itemsA = loadoutA
            .getItems()
            .stream()
            .map(LoadoutArchetypeMapper::mapInstanceToArchetype)
            .toList();
        List<WeaponArchetype> itemsB = loadoutB
            .getItems()
            .stream()
            .map(LoadoutArchetypeMapper::mapInstanceToArchetype)
            .toList();

        PlayerState stateA = new PlayerState(
            playerA.getId(),
            playerA.getUsername(),
            gameConfig.getStartingHp(),
            gameConfig.getBaseEnergy(),
            matchEngine.drawHand(itemsA),
            Collections.emptySet()
        );
        PlayerState stateB = new PlayerState(
            playerB.getId(),
            playerB.getUsername(),
            gameConfig.getStartingHp(),
            gameConfig.getBaseEnergy(),
            matchEngine.drawHand(itemsB),
            Collections.emptySet()
        );

        LiveMatchState initialState = new LiveMatchState(
            1,
            playerA.getId(),
            playerAIsT,
            stateA,
            stateB,
            new ArrayList<>(List.of("Match started! Factions deployed."))
        );
        matchStateMapper.writeToMatch(match, initialState);

        return matchRepository.save(match);
    }

    @Override
    @Transactional(readOnly = true)
    public MatchStateResponse getMatchState(Long matchId) {
        Match match = matchRepository
            .findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));

        String currentUsername = getCurrentUsername();
        return getMatchStateForUser(match, currentUsername);
    }

    @Override
    @Transactional
    public void submitAction(Long matchId, String username, Long weaponId) {
        Match match = matchRepository
            .findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));

        if (!"IN_PROGRESS".equals(match.getStatus())) {
            throw new IllegalStateException("Match has concluded.");
        }

        LiveMatchState live = matchStateMapper.readFromMatch(match);
        User actingUser = userRepository
            .findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!live.activePlayerId().equals(actingUser.getId())) {
            throw new IllegalArgumentException(
                "It is not your strategic turn!"
            );
        }

        boolean isPlayerA = match
            .getPlayerA()
            .getId()
            .equals(actingUser.getId());
        PlayerState attacker = isPlayerA
            ? live.playerAState()
            : live.playerBState();
        PlayerState defender = isPlayerA
            ? live.playerBState()
            : live.playerAState();

        // Process the combat turn
        String activeSide = resolveActiveSide(isPlayerA, live.playerAIsT());
        var turnResult = combatRoundProcessor.processTurn(
            live,
            actingUser, // Pass the full entity here
            weaponId,
            activeSide // Username is no longer needed by the processor
        );

        PlayerState newAttacker = turnResult.newAttacker();
        PlayerState newDefender = turnResult.newDefender();
        WeaponArchetype action = turnResult.actionTaken();

        live.textLogs().add(turnResult.actionLog());

        // Determine next active player
        Long nextActivePlayerId = combatRoundProcessor.resolveNextActivePlayer(
            newAttacker,
            newDefender,
            action,
            live
        );

        // Apply skip turn penalty if needed
        if (newDefender.activeEffects().contains(StatusEffect.SKIP_TURN)) {
            newDefender = combatRoundProcessor.applySkipTurnPenalty(
                newDefender,
                live
            );
            live.textLogs().add(
                newDefender.username() +
                    " lost their turn to the Smoke Grenade!"
            );
        }

        // Update match state
        String nextStatus = newDefender.hp() <= 0 ? "COMPLETED" : "IN_PROGRESS";
        User winner = newDefender.hp() <= 0 ? actingUser : null;

        LiveMatchState updatedState = new LiveMatchState(
            live.round(),
            nextActivePlayerId,
            live.playerAIsT(),
            isPlayerA ? newAttacker : newDefender,
            isPlayerA ? newDefender : newAttacker,
            live.textLogs()
        );

        match.setStatus(nextStatus);
        match.setWinner(winner);
        matchStateMapper.writeToMatch(match, updatedState);
        matchRepository.save(match);

        // Broadcast to SSE Emitters
        broadcastMatchState(matchId, match);
    }

    private MatchStateResponse getMatchStateForUser(
        Match match,
        String targetUsername
    ) {
        try {
            LiveMatchState live = matchStateMapper.readFromMatch(match);

            boolean isPlayerA = match
                .getPlayerA()
                .getUsername()
                .equalsIgnoreCase(targetUsername);
            PlayerState myState = isPlayerA
                ? live.playerAState()
                : live.playerBState();

            boolean isMyTurn = live
                .activePlayerId()
                .equals(
                    isPlayerA
                        ? match.getPlayerA().getId()
                        : match.getPlayerB().getId()
                );

            String lastLog = live.textLogs().isEmpty()
                ? "Encounter ongoing."
                : live.textLogs().get(live.textLogs().size() - 1);

            var stableHand = new ArrayList<>(myState.hand());
            stableHand.sort((w1, w2) -> Long.compare(w1.id(), w2.id()));

            String playerAStatus = "HP:" + live.playerAState().hp();
            String playerBStatus = "HP:" + live.playerBState().hp();

            return new MatchStateResponse(
                live.round(),
                playerAStatus,
                playerBStatus,
                lastLog,
                match.getStatus(),
                stableHand,
                isMyTurn,
                match.getPlayerA().getUsername(),
                match.getPlayerB().getUsername()
            );
        } catch (Exception e) {
            boolean iAmWinner =
                match.getWinner() != null &&
                match
                    .getWinner()
                    .getUsername()
                    .equalsIgnoreCase(targetUsername);
            return new MatchStateResponse(
                1,
                iAmWinner ? "HP:100" : "HP:0",
                !iAmWinner ? "HP:100" : "HP:0",
                "Combat terminated.",
                match.getStatus(),
                Collections.emptyList(),
                false,
                match.getPlayerA().getUsername(),
                match.getPlayerB().getUsername()
            );
        }
    }

    @Override
    @Transactional
    public void surrenderMatch(Long matchId, String username) {
        Match match = matchRepository
            .findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));

        if ("COMPLETED".equals(match.getStatus())) return;

        boolean isPlayerA = match
            .getPlayerA()
            .getUsername()
            .equalsIgnoreCase(username);
        User winner = isPlayerA ? match.getPlayerB() : match.getPlayerA();

        match.setWinner(winner);
        match.setStatus("COMPLETED");

        try {
            LiveMatchState current = matchStateMapper.readFromMatch(match);
            LiveMatchState finalState = new LiveMatchState(
                current.round(),
                current.activePlayerId(),
                current.playerAIsT(),
                new PlayerState(
                    current.playerAState().playerId(),
                    current.playerAState().username(),
                    isPlayerA ? 0 : current.playerAState().hp(),
                    current.playerAState().energy(),
                    Collections.emptyList(),
                    Collections.emptySet()
                ),
                new PlayerState(
                    current.playerBState().playerId(),
                    current.playerBState().username(),
                    !isPlayerA ? 0 : current.playerBState().hp(),
                    current.playerBState().energy(),
                    Collections.emptyList(),
                    Collections.emptySet()
                ),
                new ArrayList<>(
                    List.of(
                        "Match concluded via tactical retreat by " +
                            username +
                            "."
                    )
                )
            );
            matchStateMapper.writeToMatch(match, finalState);
        } catch (Exception e) {
            match.setLogsJson(null);
        }

        matchRepository.save(match);
    }

    @Override
    public SseEmitter subscribeToMatch(Long matchId) {
        String username = getCurrentUsername();
        SseEmitter emitter = new SseEmitter(-1L);
        emitters
            .computeIfAbsent(matchId, k -> new ConcurrentHashMap<>())
            .put(username, emitter);

        Runnable cleanup = () -> {
            Map<String, SseEmitter> matchEmitters = emitters.get(matchId);
            if (matchEmitters != null) {
                matchEmitters.remove(username);
                if (matchEmitters.isEmpty()) {
                    emitters.remove(matchId);
                }
            }
        };

        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        try {
            Match match = matchRepository.findById(matchId).orElseThrow();
            MatchStateResponse currentState = getMatchStateForUser(
                match,
                username
            );
            emitter.send(SseEmitter.event().name("message").data(currentState));
        } catch (Exception e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }

    // Interface contract methods (currently unused but kept for API compatibility)

    @Override
    public CombatRoundRecord executeTurn(
        Long matchId,
        Long playerId,
        Long actionId
    ) {
        // Legacy method - use submitAction() instead
        throw new UnsupportedOperationException(
            "Use submitAction() for turn execution"
        );
    }

    @Override
    public Long queueMatch(String username) {
        // Legacy stub - matchmaking not yet implemented
        return 1L;
    }

    @Override
    public String getQueueStatus(Long ticketId) {
        // Legacy stub - matchmaking not yet implemented
        return "MATCH_FOUND";
    }

    @Override
    public List<CombatRoundRecord> getMatchLogs(Long matchId) {
        // Legacy method - logs stored in match state JSON
        return Collections.emptyList();
    }

    @Override
    public void simulateAndSaveMatch(Match match) {
        // Legacy stub - simulation not used in current flow
    }

    // Private helper methods

    private String getCurrentUsername() {
        return org.springframework.security.core.context.SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
    }

    private Loadout resolveLoadout(User user, String side, String username) {
        return loadoutRepository
            .findByUserAndSide(user, side)
            .orElseGet(() ->
                loadoutRepository
                    .findByUserAndSide(user, side.toLowerCase())
                    .orElseThrow(() ->
                        new RuntimeException(
                            "Loadout missing for side configuration: " +
                                username
                        )
                    )
            );
    }

    private String resolveActiveSide(boolean isUserA, boolean playerAIsT) {
        return isUserA == playerAIsT ? "T" : "CT";
    }

    private void broadcastMatchState(Long matchId, Match match) {
        Map<String, SseEmitter> matchEmitters = emitters.get(matchId);
        if (matchEmitters != null) {
            matchEmitters.forEach((targetUsername, emitter) -> {
                try {
                    emitter.send(
                        SseEmitter.event()
                            .name("message")
                            .data(getMatchStateForUser(match, targetUsername))
                    );
                } catch (Exception e) {
                    emitter.completeWithError(e);
                }
            });
        }
    }
}
