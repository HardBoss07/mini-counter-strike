package dev.m4tt3o.minics.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.m4tt3o.minics.config.GameConfig;
import dev.m4tt3o.minics.dto.*;
import dev.m4tt3o.minics.dto.match.LiveMatchState;
import dev.m4tt3o.minics.dto.match.MatchStateResponse;
import dev.m4tt3o.minics.engine.MatchEngine;
import dev.m4tt3o.minics.entity.*;
import dev.m4tt3o.minics.repository.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final LoadoutRepository loadoutRepository;
    private final WeaponTemplateRepository weaponTemplateRepository;
    private final MatchEngine matchEngine;
    private final GameConfig gameConfig;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<Long, Map<String, SseEmitter>> emitters = new ConcurrentHashMap<>();
    
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

        Loadout loadoutA = loadoutRepository
            .findByUserAndSide(playerA, playerAIsT ? "T" : "CT")
            .orElseGet(() ->
                loadoutRepository
                    .findByUserAndSide(playerA, playerAIsT ? "t" : "ct")
                    .orElseThrow(() ->
                        new RuntimeException(
                            "Loadout missing for side configuration: " +
                                playerAUsername
                        )
                    )
            );

        Loadout loadoutB = loadoutRepository
            .findByUserAndSide(playerB, !playerAIsT ? "T" : "CT")
            .orElseGet(() ->
                loadoutRepository
                    .findByUserAndSide(playerB, !playerAIsT ? "t" : "ct")
                    .orElseThrow(() ->
                        new RuntimeException(
                            "Loadout missing for side configuration: " +
                                playerBUsername
                        )
                    )
            );

        List<WeaponArchetype> itemsA = loadoutA
            .getItems()
            .stream()
            .map(this::mapInstanceToArchetype)
            .toList();
        List<WeaponArchetype> itemsB = loadoutB
            .getItems()
            .stream()
            .map(this::mapInstanceToArchetype)
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

        try {
            LiveMatchState initialState = new LiveMatchState(
                1,
                playerA.getId(),
                stateA,
                stateB,
                new ArrayList<>(List.of("Match started! Factions deployed."))
            );
            match.setLogsJson(objectMapper.writeValueAsString(initialState));
        } catch (Exception e) {
            throw new RuntimeException(
                "Failed to serialize live state layout initialization",
                e
            );
        }

        return matchRepository.save(match);
    }

    @Override
    @Transactional(readOnly = true)
    public MatchStateResponse getMatchState(Long matchId) {
        Match match = matchRepository
            .findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));

        String currentUsername =
            org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        try {
            LiveMatchState live = objectMapper.readValue(
                match.getLogsJson(),
                LiveMatchState.class
            );

            boolean isPlayerA = match
                .getPlayerA()
                .getUsername()
                .equalsIgnoreCase(currentUsername);
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

            List<WeaponArchetype> stableHand = new java.util.ArrayList<>(
                myState.hand()
            );
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
                    .equalsIgnoreCase(currentUsername);
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

    /*
    this method currently doesnt compile, im commiting it to avoid losing work and the other changes to the SSE conversion
     */
    @Override
    @Transactional
    public void submitAction(Long matchId, String username, Long weaponId) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));

        if (!"IN_PROGRESS".equals(match.getStatus())) {
            throw new IllegalStateException("Match has concluded.");
        }

        try {
            LiveMatchState live = objectMapper.readValue(match.getLogsJson(), LiveMatchState.class);
            User actingUser = userRepository.findByUsername(username).orElseThrow();

            if (!live.activePlayerId().equals(actingUser.getId())) {
                throw new IllegalArgumentException("It is not your strategic turn!");
            }

            boolean isPlayerA = match.getPlayerA().getId().equals(actingUser.getId());
            PlayerState attacker = isPlayerA ? live.playerAState() : live.playerBState();
            PlayerState defender = isPlayerA ? live.playerBState() : live.playerAState();

            WeaponArchetype action = attacker.hand().stream()
                .filter(w -> w.id().equals(weaponId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Weapon not in current hand!"));

            CombatRoundRecord result = matchEngine.resolveTurn(attacker, defender, action, live.round());

            // 1. Remove the played card
            List<WeaponArchetype> currentHand = new ArrayList<>(result.playerA().hand());
            currentHand.removeIf(w -> w.id().equals(weaponId));

            // 2. Replenish hand logic: Respect the Match/Round side-mapping
            // This is the logic your previous version used to determine the correct Loadout
            boolean playerAIsT = (live.round() == 1);
            boolean isUserA = match.getPlayerA().getId().equals(actingUser.getId());
            String activeSide = (isUserA == playerAIsT) ? "T" : "CT";

            Loadout userLoadout = loadoutRepository.findByUserAndSide(actingUser, activeSide)
                .orElseThrow(() -> new RuntimeException("Loadout missing for side: " + activeSide));
            
            List<WeaponArchetype> loadoutItems = userLoadout.getItems().stream()
                .map(this::mapToArchetype).toList();

            List<WeaponArchetype> remainingPool = loadoutItems.stream()
                .filter(item -> currentHand.stream().noneMatch(handItem -> handItem.id().equals(item.id())))
                .toList();

            if (!remainingPool.isEmpty()) {
                int totalWeight = remainingPool.stream().mapToInt(WeaponArchetype::drawWeight).sum();
                int r = new java.security.SecureRandom().nextInt(totalWeight > 0 ? totalWeight : 1);
                int current = 0;
                WeaponArchetype replacement = remainingPool.get(remainingPool.size() - 1);
                for (WeaponArchetype item : remainingPool) {
                    current += item.drawWeight();
                    if (r < current) { replacement = item; break; }
                }
                currentHand.add(replacement);
            }

            PlayerState newAttacker = new PlayerState(attacker.playerId(), attacker.username(), result.playerA().hp(), result.playerA().energy(), currentHand, result.playerA().activeEffects());
            PlayerState newDefender = result.playerB();
            
            live.textLogs().add(result.actionLog());

            boolean isUtility = action.type() == ItemType.UTILITY;
            Long nextActivePlayerId = defender.playerId(); 

            if (isUtility) {
                nextActivePlayerId = attacker.playerId();
            } else if (newDefender.activeEffects().contains(StatusEffect.SKIP_TURN)) {
                nextActivePlayerId = attacker.playerId();

                java.util.Set<StatusEffect> clearedEffects = new java.util.HashSet<>(newDefender.activeEffects());
                clearedEffects.remove(StatusEffect.SKIP_TURN);
                newDefender = new PlayerState(newDefender.playerId(), newDefender.username(), newDefender.hp(), newDefender.energy(), newDefender.hand(), clearedEffects);
                live.textLogs().add(newDefender.username() + " lost their turn to the Smoke Grenade!");
            }

            String nextStatus = (newDefender.hp() <= 0) ? "COMPLETED" : "IN_PROGRESS";
            User winner = (newDefender.hp() <= 0) ? actingUser : null;

            LiveMatchState updatedState = new LiveMatchState(live.round(), nextActivePlayerId, 
                isPlayerA ? newAttacker : newDefender, 
                isPlayerA ? newDefender : newAttacker, 
                live.textLogs());

            match.setStatus(nextStatus);
            match.setWinner(winner);
            match.setLogsJson(objectMapper.writeValueAsString(updatedState));
            matchRepository.save(match);

            // 5. Broadcast to SSE Emitters
            Map<String, SseEmitter> matchEmitters = emitters.get(matchId);
            if (matchEmitters != null) {
                matchEmitters.forEach((targetUsername, emitter) -> {
                    try {
                        emitter.send(SseEmitter.event().name("message").data(getMatchStateForUser(match, targetUsername)));
                    } catch (Exception e) { emitter.completeWithError(e); }
                });
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to process action: " + e.getMessage(), e);
        }
    }

    private MatchStateResponse getMatchStateForUser(Match match, String targetUsername) {
        try {
            LiveMatchState live = objectMapper.readValue(match.getLogsJson(), LiveMatchState.class);

            boolean isPlayerA = match.getPlayerA().getUsername().equalsIgnoreCase(targetUsername);
            PlayerState myState = isPlayerA ? live.playerAState() : live.playerBState();

            boolean isMyTurn = live.activePlayerId().equals(
                isPlayerA ? match.getPlayerA().getId() : match.getPlayerB().getId()
            );
            
            String lastLog = live.textLogs().isEmpty() ? "Encounter ongoing." : live.textLogs().get(live.textLogs().size() - 1);

            List<WeaponArchetype> stableHand = new java.util.ArrayList<>(myState.hand());
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
            boolean iAmWinner = match.getWinner() != null && match.getWinner().getUsername().equalsIgnoreCase(targetUsername);
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
            LiveMatchState current = objectMapper.readValue(
                match.getLogsJson(),
                LiveMatchState.class
            );
            LiveMatchState finalState = new LiveMatchState(
                current.round(),
                current.activePlayerId(),
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
            match.setLogsJson(objectMapper.writeValueAsString(finalState));
        } catch (Exception e) {
            match.setLogsJson(null);
        }

        matchRepository.save(match);
    }

    @Override
    @Transactional
    public CombatRoundRecord executeTurn(
        Long matchId,
        Long playerId,
        Long actionId
    ) {
        Match match = matchRepository
            .findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));

        WeaponTemplate actionTemplate = weaponTemplateRepository
            .findById(actionId)
            .orElseThrow(() ->
                new RuntimeException("Action template not found")
            );

        WeaponArchetype action = mapToArchetype(actionTemplate);

        PlayerState attacker = mockPlayerState(
            playerId.equals(match.getPlayerA().getId())
                ? match.getPlayerA()
                : match.getPlayerB()
        );
        PlayerState defender = mockPlayerState(
            playerId.equals(match.getPlayerA().getId())
                ? match.getPlayerB()
                : match.getPlayerA()
        );

        return matchEngine.resolveTurn(attacker, defender, action, 1);
    }

    @Override
    public List<CombatRoundRecord> getMatchLogs(Long matchId) {
        Match match = matchRepository
            .findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));
        if (
            match.getLogsJson() == null ||
            "IN_PROGRESS".equals(match.getStatus())
        ) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(
                match.getLogsJson(),
                new com.fasterxml.jackson.core.type.TypeReference<
                    List<CombatRoundRecord>
                >() {}
            );
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private PlayerState mockPlayerState(User user) {
        Loadout loadout = loadoutRepository
            .findByUserAndSide(user, "T")
            .orElseGet(() ->
                loadoutRepository
                    .findByUserAndSide(user, "t")
                    .orElseGet(() ->
                        loadoutRepository
                            .findByUserAndSide(user, "CT")
                            .orElseGet(() ->
                                loadoutRepository
                                    .findByUserAndSide(user, "ct")
                                    .orElseThrow(() ->
                                        new RuntimeException(
                                            "No loadout found for " +
                                                user.getUsername()
                                        )
                                    )
                            )
                    )
            );

        List<WeaponArchetype> items = loadout
            .getItems()
            .stream()
            .map(this::mapInstanceToArchetype)
            .toList();

        List<WeaponArchetype> hand = matchEngine.drawHand(items);

        return new PlayerState(
            user.getId(),
            user.getUsername(),
            gameConfig.getStartingHp(),
            gameConfig.getBaseEnergy(),
            hand,
            Collections.emptySet()
        );
    }

    private List<WeaponArchetype> mapLoadoutToArchetypes(Loadout loadout) {
        return loadout
            .getItems()
            .stream()
            .map(this::mapInstanceToArchetype)
            .toList();
    }

    private WeaponArchetype mapInstanceToArchetype(UserWeaponInstance inst) {
        WeaponTemplate t = inst.getTemplate();
        int energyCost = Math.max(
            0,
            t.getEnergyCost() + inst.getCostModifier()
        );
        int damage = Math.max(0, t.getDamage() + inst.getDamageModifier());
        int drawWeight = Math.max(
            1,
            t.getDrawWeight() + inst.getDrawWeightModifier()
        );

        return new WeaponArchetype(
            t.getId(),
            t.getName(),
            t.getType(),
            t.getSide(),
            energyCost,
            damage,
            drawWeight,
            t.getCritChance() != null ? t.getCritChance() : 0.0,
            t.getCritMultiplier() != null ? t.getCritMultiplier() : 1.0,
            t.getStatusEffect() != null ? t.getStatusEffect() : "NONE",
            t.getRarity(),
            t.getImageUrl(),
            t.getDescription()
        );
    }

    private WeaponArchetype mapToArchetype(WeaponTemplate t) {
        return new WeaponArchetype(
            t.getId(),
            t.getName(),
            t.getType(),
            t.getSide(),
            t.getEnergyCost(),
            t.getDamage(),
            t.getDrawWeight(),
            t.getCritChance() != null ? t.getCritChance() : 0.0,
            t.getCritMultiplier() != null ? t.getCritMultiplier() : 1.0,
            t.getStatusEffect() != null ? t.getStatusEffect() : "NONE",
            t.getRarity(),
            t.getImageUrl(),
            t.getDescription()
        );
    }

    @Override
    public SseEmitter subscribeToMatch(Long matchId) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        
        SseEmitter emitter = new SseEmitter(-1L); 
        emitters.computeIfAbsent(matchId, k -> new ConcurrentHashMap<>()).put(username, emitter);

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
            MatchStateResponse currentState = getMatchStateForUser(match, username);
            emitter.send(SseEmitter.event().name("message").data(currentState));
        } catch (Exception e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }

    public Long queueMatch(String username) {
        return 1L;
    }

    public String getQueueStatus(Long ticketId) {
        return "MATCH_FOUND";
    }

    public void simulateAndSaveMatch(Match match) {}
}
