package dev.m4tt3o.minics.service.combat;

import dev.m4tt3o.minics.config.GameConfig;
import dev.m4tt3o.minics.dto.CombatRoundRecord;
import dev.m4tt3o.minics.dto.ItemType;
import dev.m4tt3o.minics.dto.PlayerState;
import dev.m4tt3o.minics.dto.StatusEffect;
import dev.m4tt3o.minics.dto.WeaponArchetype;
import dev.m4tt3o.minics.dto.match.LiveMatchState;
import dev.m4tt3o.minics.engine.MatchEngine;
import dev.m4tt3o.minics.entity.Loadout;
import dev.m4tt3o.minics.entity.User;
import dev.m4tt3o.minics.repository.LoadoutRepository;
import dev.m4tt3o.minics.service.mapper.LoadoutArchetypeMapper;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Encapsulates the logic for processing a single combat turn.
 * Handles hand replenishment, weapon selection, and turn resolution.
 */
@Component
@RequiredArgsConstructor
public class CombatRoundProcessor {

    private final MatchEngine matchEngine;
    private final GameConfig gameConfig;
    private final LoadoutRepository loadoutRepository;
    private final SecureRandom random = new SecureRandom();

    /**
     * Processes a turn action: validates the weapon, executes combat,
     * replenishes hand, and returns the result.
     */
    public TurnProcessingResult processTurn(
        LiveMatchState currentState,
        User actingUser, // <-- Accept the User entity
        Long weaponId,
        String activeSide // <-- Accept the resolved activeSide directly
    ) {
        // Use the entity's ID for the check
        boolean isPlayerA = actingUser
            .getId()
            .equals(currentState.playerAState().playerId());

        PlayerState attacker = isPlayerA
            ? currentState.playerAState()
            : currentState.playerBState();
        PlayerState defender = isPlayerA
            ? currentState.playerBState()
            : currentState.playerAState();

        // Find the selected weapon in hand
        WeaponArchetype action = attacker
            .hand()
            .stream()
            .filter(w -> w.id().equals(weaponId))
            .findFirst()
            .orElseThrow(() ->
                new IllegalArgumentException("Weapon not in current hand!")
            );

        // Resolve the combat turn
        CombatRoundRecord result = matchEngine.resolveTurn(
            attacker,
            defender,
            action,
            currentState.round()
        );

        // Remove the played card from hand
        List<WeaponArchetype> currentHand = new ArrayList<>(
            result.playerA().hand()
        );
        currentHand.removeIf(w -> w.id().equals(weaponId));

        // Replenish hand from loadout
        // <-- FIX: Pass the fully managed actingUser entity here
        Loadout userLoadout = loadoutRepository
            .findByUserAndSide(actingUser, activeSide)
            .orElseThrow(() ->
                new RuntimeException("Loadout missing for side: " + activeSide)
            );

        List<WeaponArchetype> loadoutItems = userLoadout
            .getItems()
            .stream()
            .map(LoadoutArchetypeMapper::mapInstanceToArchetype)
            .toList();

        List<WeaponArchetype> remainingPool = loadoutItems
            .stream()
            .filter(item ->
                currentHand
                    .stream()
                    .noneMatch(handItem -> handItem.id().equals(item.id()))
            )
            .toList();

        if (!remainingPool.isEmpty()) {
            WeaponArchetype replacement = selectReplacementWeapon(
                remainingPool
            );
            currentHand.add(replacement);
        }

        // Build new player states
        PlayerState newAttacker = new PlayerState(
            attacker.playerId(),
            attacker.username(),
            result.playerA().hp(),
            result.playerA().energy(),
            currentHand,
            result.playerA().activeEffects()
        );
        PlayerState newDefender = result.playerB();

        return new TurnProcessingResult(
            newAttacker,
            newDefender,
            result.actionLog(),
            action
        );
    }

    /**
     * Determines the next active player based on utility and status effects.
     */
    public Long resolveNextActivePlayer(
        PlayerState attacker,
        PlayerState defender,
        WeaponArchetype action,
        LiveMatchState currentState
    ) {
        boolean isUtility = action.type() == ItemType.UTILITY;
        if (isUtility) {
            return attacker.playerId();
        }

        if (defender.activeEffects().contains(StatusEffect.SKIP_TURN)) {
            return attacker.playerId();
        }

        return defender.playerId();
    }

    /**
     * Applies SKIP_TURN penalty if applicable.
     */
    public PlayerState applySkipTurnPenalty(
        PlayerState defender,
        LiveMatchState currentState
    ) {
        if (!defender.activeEffects().contains(StatusEffect.SKIP_TURN)) {
            return defender;
        }

        Set<StatusEffect> clearedEffects = new HashSet<>(
            defender.activeEffects()
        );
        clearedEffects.remove(StatusEffect.SKIP_TURN);

        return new PlayerState(
            defender.playerId(),
            defender.username(),
            defender.hp(),
            defender.energy(),
            defender.hand(),
            clearedEffects
        );
    }

    private WeaponArchetype selectReplacementWeapon(
        List<WeaponArchetype> pool
    ) {
        int totalWeight = pool
            .stream()
            .mapToInt(WeaponArchetype::drawWeight)
            .sum();

        if (totalWeight <= 0) {
            return pool.get(random.nextInt(pool.size()));
        }

        int r = random.nextInt(totalWeight);
        int current = 0;

        for (WeaponArchetype item : pool) {
            current += item.drawWeight();
            if (r < current) {
                return item;
            }
        }

        return pool.get(pool.size() - 1);
    }

    /**
     * DTO for turn processing result.
     */
    public record TurnProcessingResult(
        PlayerState newAttacker,
        PlayerState newDefender,
        String actionLog,
        WeaponArchetype actionTaken
    ) {}
}
