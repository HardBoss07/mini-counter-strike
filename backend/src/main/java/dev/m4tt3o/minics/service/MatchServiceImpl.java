package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.config.GameConfig;
import dev.m4tt3o.minics.dto.*;
import dev.m4tt3o.minics.dto.match.MatchStateResponse;
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
        return matchRepository.save(match);
    }

    @Override
    @Transactional
    public void simulateAndSaveMatch(Match match) {
        User playerA = match.getPlayerA();
        User playerB = match.getPlayerB();

        // 1. Get loadouts for both players with defensive fallbacks to avoid queue freezes
        Loadout playerATLoadoutEntity = loadoutRepository.findByUserAndSide(playerA, "T")
                .orElseGet(() -> loadoutRepository.findByUserAndSide(playerA, "t")
                .orElseThrow(() -> new RuntimeException("T Loadout not found for user: " + playerA.getUsername())));
        
        Loadout playerACTLoadoutEntity = loadoutRepository.findByUserAndSide(playerA, "CT")
                .orElseGet(() -> loadoutRepository.findByUserAndSide(playerA, "ct")
                .orElseThrow(() -> new RuntimeException("CT Loadout not found for user: " + playerA.getUsername())));
        
        Loadout playerBTLoadoutEntity = loadoutRepository.findByUserAndSide(playerB, "T")
                .orElseGet(() -> loadoutRepository.findByUserAndSide(playerB, "t")
                .orElseThrow(() -> new RuntimeException("T Loadout not found for user: " + playerB.getUsername())));
        
        Loadout playerBCTLoadoutEntity = loadoutRepository.findByUserAndSide(playerB, "CT")
                .orElseGet(() -> loadoutRepository.findByUserAndSide(playerB, "ct")
                .orElseThrow(() -> new RuntimeException("CT Loadout not found for user: " + playerB.getUsername())));

        List<WeaponArchetype> playerATLoadout = mapLoadoutToArchetypes(playerATLoadoutEntity);
        List<WeaponArchetype> playerACTLoadout = mapLoadoutToArchetypes(playerACTLoadoutEntity);
        List<WeaponArchetype> playerBTLoadout = mapLoadoutToArchetypes(playerBTLoadoutEntity);
        List<WeaponArchetype> playerBCTLoadout = mapLoadoutToArchetypes(playerBCTLoadoutEntity);

        // 2. Initialize starting states
        PlayerState pAStart = new PlayerState(playerA.getId(), playerA.getUsername(), gameConfig.getStartingHp(), 0, Collections.emptyList(), Collections.emptySet());
        PlayerState pBStart = new PlayerState(playerB.getId(), playerB.getUsername(), gameConfig.getStartingHp(), 0, Collections.emptyList(), Collections.emptySet());

        // 3. Simulate Round 1 (Player A is T, Player B is CT)
        List<CombatRoundRecord> round1Records = matchEngine.simulateMatch(pAStart, playerATLoadout, pBStart, playerBCTLoadout);

        // Winner of Round 1
        boolean playerAWonRound1 = false;
        int round1Turns = 0;
        if (!round1Records.isEmpty()) {
            CombatRoundRecord lastRecord = round1Records.get(round1Records.size() - 1);
            playerAWonRound1 = lastRecord.playerB().hp() <= 0;
            round1Turns = round1Records.size();
        }

        // 4. Simulate Round 2 (Player A is CT, Player B is T)
        List<CombatRoundRecord> round2Records = matchEngine.simulateMatch(pBStart, playerBTLoadout, pAStart, playerACTLoadout);

        // Winner of Round 2
        boolean playerAWonRound2 = false;
        int round2Turns = 0;
        if (!round2Records.isEmpty()) {
            CombatRoundRecord lastRecord = round2Records.get(round2Records.size() - 1);
            playerAWonRound2 = lastRecord.playerA().hp() <= 0;
            round2Turns = round2Records.size();
        }

        // 5. Combine records
        List<CombatRoundRecord> allRecords = new ArrayList<>();
        allRecords.addAll(round1Records);
        allRecords.addAll(round2Records);

        // 6. Determine winner & Apply Turn Efficiency Tie-breaker if needed
        User winnerUser = null;
        if (playerAWonRound1 && playerAWonRound2) {
            winnerUser = playerA;
        } else if (!playerAWonRound1 && !playerAWonRound2) {
            winnerUser = playerB;
        } else {
            // Match score is 1-1. Use turn efficiency.
            int playerATurns = playerAWonRound1 ? round1Turns : round2Turns;
            int playerBTurns = !playerAWonRound1 ? round1Turns : round2Turns;

            if (playerATurns < playerBTurns) {
                winnerUser = playerA;
            } else if (playerBTurns < playerATurns) {
                winnerUser = playerB;
            } else {
                winnerUser = playerA; // Default tie-breaker
            }
        }

        match.setWinner(winnerUser);
        match.setStatus("COMPLETED");

        try {
            String serializedLogs = objectMapper.writeValueAsString(allRecords);
            match.setLogsJson(serializedLogs);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize combat logs", e);
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

    public Long queueMatch(String username) { return 1L; }
    public String getQueueStatus(Long ticketId) { return "MATCH_FOUND"; }

    @Override
    public MatchStateResponse getMatchState(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        List<CombatRoundRecord> logs = getMatchLogs(matchId);
        String lastLog = "Start match";
        String playerAStatus = "HP:100";
        String playerBStatus = "HP:100";
        int round = 1;

        if (!logs.isEmpty()) {
            CombatRoundRecord lastRecord = logs.get(logs.size() - 1);
            playerAStatus = "HP:" + lastRecord.playerA().hp();
            playerBStatus = "HP:" + lastRecord.playerB().hp();
            lastLog = lastRecord.actionLog();
        }

        return new MatchStateResponse(round, playerAStatus, playerBStatus, lastLog);
    }

    public void submitAction(Long matchId, String username, Long weaponId) {}

    @Override
    public List<CombatRoundRecord> getMatchLogs(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));
        if (match.getLogsJson() == null) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(match.getLogsJson(), new com.fasterxml.jackson.core.type.TypeReference<List<CombatRoundRecord>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize logs", e);
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
}
