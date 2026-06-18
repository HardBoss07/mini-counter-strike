package dev.m4tt3o.mini_cs.service;

import dev.m4tt3o.mini_cs.config.GameConfig;
import dev.m4tt3o.mini_cs.dto.*;
import dev.m4tt3o.mini_cs.engine.MatchEngine;
import dev.m4tt3o.mini_cs.entity.*;
import dev.m4tt3o.mini_cs.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final LoadoutRepository loadoutRepository;
    private final WeaponTemplateRepository weaponTemplateRepository;
    private final MatchEngine matchEngine;
    private final GameConfig gameConfig;

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
    public CombatRoundRecord executeTurn(Long matchId, Long playerId, Long actionId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        WeaponTemplate actionTemplate = weaponTemplateRepository.findById(actionId)
                .orElseThrow(() -> new RuntimeException("Action template not found"));

        WeaponArchetype action = mapToArchetype(actionTemplate);

        // For simplicity in this baseline, we'll mock the current states
        // In a real app, these would be tracked in MatchState logs
        PlayerState attacker = mockPlayerState(playerId.equals(match.getPlayerA().getId()) ? match.getPlayerA() : match.getPlayerB());
        PlayerState defender = mockPlayerState(playerId.equals(match.getPlayerA().getId()) ? match.getPlayerB() : match.getPlayerA());

        return matchEngine.resolveTurn(attacker, defender, action, 1);
    }

    private PlayerState mockPlayerState(User user) {
        // Load T-side loadout by default for this baseline
        Loadout loadout = loadoutRepository.findByUserAndSide(user, "T")
                .orElseGet(() -> loadoutRepository.findByUserAndSide(user, "CT")
                .orElseThrow(() -> new RuntimeException("No loadout found for " + user.getUsername())));

        List<WeaponArchetype> items = loadout.getItems().stream()
                .map(i -> mapToArchetype(i.getTemplate())).toList();

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
