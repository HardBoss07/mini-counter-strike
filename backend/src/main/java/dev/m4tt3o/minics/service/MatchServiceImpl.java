package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.config.GameConfig;
import dev.m4tt3o.minics.dto.*;
import dev.m4tt3o.minics.dto.match.MatchStateResponse;
import dev.m4tt3o.minics.dto.match.LiveMatchState; // Clean record definition wrapping live payloads
import dev.m4tt3o.minics.engine.MatchEngine;
import dev.m4tt3o.minics.entity.*;
import dev.m4tt3o.minics.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

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

    @Override
    @Transactional
    public Match createMatch(String playerAUsername, String playerBUsername) {
        User playerA = userRepository.findByUsername(playerAUsername)
                .orElseThrow(() -> new RuntimeException("Player A not found"));
        User playerB = userRepository.findByUsername(playerBUsername)
                .orElseThrow(() -> new RuntimeException("Player B not found"));

        Match match = new Match();
        match.setPlayerA(playerA);
        match.setPlayerB(playerB);
        match.setStatus("IN_PROGRESS");

        // Bug Fix: Randomly assign starting sides (True = A is T / B is CT, False = A is CT / B is T)
        boolean playerAIsT = new java.security.SecureRandom().nextBoolean();

        Loadout loadoutA = loadoutRepository.findByUserAndSide(playerA, playerAIsT ? "T" : "CT")
                .orElseGet(() -> loadoutRepository.findByUserAndSide(playerA, playerAIsT ? "t" : "ct")
                .orElseThrow(() -> new RuntimeException("Loadout missing for side configuration: " + playerAUsername)));
        
        Loadout loadoutB = loadoutRepository.findByUserAndSide(playerB, !playerAIsT ? "T" : "CT")
                .orElseGet(() -> loadoutRepository.findByUserAndSide(playerB, !playerAIsT ? "t" : "ct")
                .orElseThrow(() -> new RuntimeException("Loadout missing for side configuration: " + playerBUsername)));

        List<WeaponArchetype> itemsA = loadoutA.getItems().stream().map(this::mapInstanceToArchetype).toList();
        List<WeaponArchetype> itemsB = loadoutB.getItems().stream().map(this::mapInstanceToArchetype).toList();

        // Lock in the original drew hands inside a tracking JSON blob payload state container
        PlayerState stateA = new PlayerState(playerA.getId(), playerA.getUsername(), gameConfig.getStartingHp(), gameConfig.getBaseEnergy(), matchEngine.drawHand(itemsA), Collections.emptySet());
        PlayerState stateB = new PlayerState(playerB.getId(), playerB.getUsername(), gameConfig.getStartingHp(), gameConfig.getBaseEnergy(), matchEngine.drawHand(itemsB), Collections.emptySet());

        try {
            LiveMatchState initialState = new LiveMatchState(
                1, 
                playerA.getId(), // Player A gets first turn priority by default
                stateA, 
                stateB, 
                new ArrayList<>(List.of("Match started! Factions deployed."))
            );
            match.setLogsJson(objectMapper.writeValueAsString(initialState));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize live state layout initialization", e);
        }

        return matchRepository.save(match);
    }

    @Override
    @Transactional(readOnly = true)
    public MatchStateResponse getMatchState(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        String currentUsername = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();

        try {
            LiveMatchState live = objectMapper.readValue(match.getLogsJson(), LiveMatchState.class);
            
            boolean isPlayerA = match.getPlayerA().getUsername().equalsIgnoreCase(currentUsername);
            PlayerState myState = isPlayerA ? live.playerAState() : live.playerBState();
            
            boolean isMyTurn = live.activePlayerId().equals(isPlayerA ? match.getPlayerA().getId() : match.getPlayerB().getId());
            String lastLog = live.textLogs().isEmpty() ? "Encounter ongoing." : live.textLogs().get(live.textLogs().size() - 1);

            // Bug Fix: Explicitly sort drawn card collection using weapon template ID 
            // to make sure position renders identically across sequential HTTP view poll cycles
            List<WeaponArchetype> stableHand = new java.util.ArrayList<>(myState.hand());
            stableHand.sort((w1, w2) -> Long.compare(w1.id(), w2.id()));

            return new MatchStateResponse(
                    live.round(),
                    "HP:" + live.playerAState().hp(),
                    "HP:" + live.playerBState().hp(),
                    lastLog,
                    match.getStatus(),
                    stableHand, 
                    isMyTurn,
                    match.getPlayerA().getUsername(),
                    match.getPlayerB().getUsername()
            );
        } catch (Exception e) {
            // Failsafe fallback handling for surrenders or disrupted JSON payloads
            return new MatchStateResponse(
                1, 
                match.getWinner() != null && match.getWinner().getId().equals(match.getPlayerA().getId()) ? "HP:100" : "HP:0", 
                match.getWinner() != null && match.getWinner().getId().equals(match.getPlayerB().getId()) ? "HP:100" : "HP:0", 
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

            // Locate active card matching structural criteria straight out of locked stable hand list
            WeaponArchetype action = attacker.hand().stream()
                    .filter(w -> w.id().equals(weaponId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Selected action weapon not found in deck hand."));

            // Resolve tactical exchange parameters inside engine core
            CombatRoundRecord result = matchEngine.resolveTurn(attacker, defender, action, 1);
            
            // Re-fetch original full loadout profile dynamically to safely generate cards for next loop
            Loadout userLoadout = loadoutRepository.findByUserAndSide(actingUser, action.side())
                    .orElseGet(() -> loadoutRepository.findByUserAndSide(actingUser, action.side().toLowerCase())
                    .orElseThrow(() -> new RuntimeException("Loadout composition structure trace failed.")));
            List<WeaponArchetype> loadoutItems = userLoadout.getItems().stream().map(this::mapInstanceToArchetype).toList();
            
            // Re-populate and shift values
            PlayerState newAttacker = new PlayerState(
                    attacker.playerId(), attacker.username(), 
                    result.playerA().hp(), result.playerA().energy(), 
                    matchEngine.drawHand(loadoutItems), 
                    result.playerA().activeEffects()
            );
            
            PlayerState newDefender = result.playerB();

            String nextStatus = "IN_PROGRESS";
            User winner = null;
            
            if (newDefender.hp() <= 0) {
                nextStatus = "COMPLETED";
                winner = actingUser;
            }

            live.textLogs().add(result.actionLog());

            LiveMatchState updatedState = new LiveMatchState(
                    live.round(),
                    defender.playerId(), // Toggle perspective focus turn indicator block to opponent target
                    isPlayerA ? newAttacker : newDefender,
                    isPlayerA ? newDefender : newAttacker,
                    live.textLogs()
            );

            match.setStatus(nextStatus);
            match.setWinner(winner);
            match.setLogsJson(objectMapper.writeValueAsString(updatedState));
            matchRepository.save(match);

        } catch (Exception e) {
            throw new RuntimeException("Encounter resolution engine step update failure", e);
        }
    }

    @Override
    @Transactional
    public void surrenderMatch(Long matchId, String username) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));
                
        if ("COMPLETED".equals(match.getStatus())) return;

        boolean isPlayerA = match.getPlayerA().getUsername().equalsIgnoreCase(username);
        User winner = isPlayerA ? match.getPlayerB() : match.getPlayerA();
        
        match.setWinner(winner);
        match.setStatus("COMPLETED");
        
        // Setup final traces so user gets accurate reports
        try {
            LiveMatchState current = objectMapper.readValue(match.getLogsJson(), LiveMatchState.class);
            LiveMatchState finalState = new LiveMatchState(
                current.round(),
                current.activePlayerId(),
                new PlayerState(current.playerAState().playerId(), current.playerAState().username(), isPlayerA ? 0 : current.playerAState().hp(), current.playerAState().energy(), Collections.emptyList(), Collections.emptySet()),
                new PlayerState(current.playerBState().playerId(), current.playerBState().username(), !isPlayerA ? 0 : current.playerBState().hp(), current.playerBState().energy(), Collections.emptyList(), Collections.emptySet()),
                new ArrayList<>(List.of("Match concluded via tactical retreat by " + username + "."))
            );
            match.setLogsJson(objectMapper.writeValueAsString(finalState));
        } catch (Exception e) {
            match.setLogsJson(null);
        }
        
        matchRepository.save(match);
    }

    @Override
    @Transactional
    public CombatRoundRecord executeTurn(Long matchId, Long playerId, Long actionId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        WeaponTemplate actionTemplate = weaponTemplateRepository.findById(actionId)
                .orElseThrow(() -> new RuntimeException("Action template not found"));

        WeaponArchetype action = mapToArchetype(actionTemplate);

        PlayerState attacker = mockPlayerState(playerId.equals(match.getPlayerA().getId()) ? match.getPlayerA() : match.getPlayerB());
        PlayerState defender = mockPlayerState(playerId.equals(match.getPlayerA().getId()) ? match.getPlayerB() : match.getPlayerA());

        return matchEngine.resolveTurn(attacker, defender, action, 1);
    }

    @Override
    public List<CombatRoundRecord> getMatchLogs(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));
        if (match.getLogsJson() == null || "IN_PROGRESS".equals(match.getStatus())) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(match.getLogsJson(), new com.fasterxml.jackson.core.type.TypeReference<List<CombatRoundRecord>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private PlayerState mockPlayerState(User user) {
        Loadout loadout = loadoutRepository.findByUserAndSide(user, "T")
                .orElseGet(() -> loadoutRepository.findByUserAndSide(user, "t")
                .orElseGet(() -> loadoutRepository.findByUserAndSide(user, "CT")
                .orElseGet(() -> loadoutRepository.findByUserAndSide(user, "ct")
                .orElseThrow(() -> new RuntimeException("No loadout found for " + user.getUsername())))));

        List<WeaponArchetype> items = loadout.getItems().stream()
                .map(this::mapInstanceToArchetype).toList();

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
        return loadout.getItems().stream()
                .map(this::mapInstanceToArchetype).toList();
    }

    private WeaponArchetype mapInstanceToArchetype(UserWeaponInstance inst) {
        WeaponTemplate t = inst.getTemplate();
        int energyCost = Math.max(0, t.getEnergyCost() + inst.getCostModifier());
        int damage = Math.max(0, t.getDamage() + inst.getDamageModifier());
        int drawWeight = Math.max(1, t.getDrawWeight() + inst.getDrawWeightModifier());

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
                t.getImageUrl(),
                t.getDescription()
        );
    }

    public Long queueMatch(String username) { return 1L; }
    public String getQueueStatus(Long ticketId) { return "MATCH_FOUND"; }
    public void simulateAndSaveMatch(Match match) {}
}