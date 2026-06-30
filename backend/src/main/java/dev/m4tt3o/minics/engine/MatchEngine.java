package dev.m4tt3o.minics.engine;

import dev.m4tt3o.minics.dto.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Core engine for tactical game mechanics.
 * Orchestrates hand drawing, match simulation, and turn resolution.
 */
@Component
@RequiredArgsConstructor
public class MatchEngine {

    private final Random random;
    private final CombatMechanicsProcessor combatProcessor;

    /**
     * Draws exactly 3 items from a 5-item loadout based on their draw weights.
     */
    public List<WeaponArchetype> drawHand(List<WeaponArchetype> loadout) {
        if (loadout.size() != 5) {
            throw new IllegalArgumentException(
                "Loadout must contain exactly 5 items."
            );
        }

        List<WeaponArchetype> hand = new ArrayList<>();
        List<WeaponArchetype> pool = new ArrayList<>(loadout);

        for (int i = 0; i < 3; i++) {
            WeaponArchetype selected = selectByWeight(pool);
            hand.add(selected);
            pool.remove(selected);
        }

        return hand;
    }

    /**
     * Simulates a full round between two players until one reaches 0 HP.
     */
    public List<CombatRoundRecord> simulateMatch(
        PlayerState p1,
        List<WeaponArchetype> p1Loadout,
        PlayerState p2,
        List<WeaponArchetype> p2Loadout
    ) {
        List<CombatRoundRecord> logs = new ArrayList<>();
        int turnNumber = 1;

        PlayerState attacker = p1;
        List<WeaponArchetype> attackerLoadout = p1Loadout;

        PlayerState defender = p2;
        List<WeaponArchetype> defenderLoadout = p2Loadout;

        while (attacker.hp() > 0 && defender.hp() > 0 && turnNumber <= 100) {
            int playerTurn = (turnNumber + 1) / 2;
            int energyToAdd = Math.min(playerTurn + 1, 10);
            int currentEnergy = Math.min(attacker.energy() + energyToAdd, 10);

            // Draw Hand
            List<WeaponArchetype> hand = drawHand(attackerLoadout);
            attacker = new PlayerState(
                attacker.playerId(),
                attacker.username(),
                attacker.hp(),
                currentEnergy,
                hand,
                attacker.activeEffects()
            );

            // Simple AI: Pick highest damage weapon we can afford.
            final int currentEnergyForFilter = attacker.energy();
            WeaponArchetype selectedAction = hand
                .stream()
                .filter(w -> w.energyCost() <= currentEnergyForFilter)
                .max((w1, w2) -> Integer.compare(w1.damage(), w2.damage()))
                .orElse(null);

            if (selectedAction == null) {
                CombatRoundRecord record = new CombatRoundRecord(
                    turnNumber,
                    attacker,
                    defender,
                    String.format("%s saved energy.", attacker.username()),
                    attacker.playerId()
                );
                logs.add(record);
            } else {
                CombatRoundRecord record = resolveTurn(
                    attacker,
                    defender,
                    selectedAction,
                    turnNumber
                );
                logs.add(record);
                attacker = record.playerA();
                defender = record.playerB();
            }

            // Swap roles
            PlayerState temp = attacker;
            attacker = defender;
            defender = temp;

            List<WeaponArchetype> tempLoadout = attackerLoadout;
            attackerLoadout = defenderLoadout;
            defenderLoadout = tempLoadout;

            turnNumber++;
        }

        return logs;
    }

    /**
     * Resolves a single combat turn including status effects and critical hits.
     */
    public CombatRoundRecord resolveTurn(
        PlayerState attacker,
        PlayerState defender,
        WeaponArchetype action,
        int turnNumber
    ) {
        StringBuilder log = new StringBuilder();
        Set<StatusEffect> attackerEffects = new HashSet<>(
            attacker.activeEffects()
        );
        Set<StatusEffect> defenderEffects = new HashSet<>(
            defender.activeEffects()
        );

        int attackerHp = attacker.hp();
        int defenderHp = defender.hp();
        int energySpent = action.energyCost();

        // 1. Apply burn damage at start of turn
        int burnDamage = combatProcessor.applyBurnDamage(
            attackerHp,
            attackerEffects
        );
        if (burnDamage < attackerHp) {
            attackerHp = burnDamage;
            attackerEffects = combatProcessor.removeBurnEffect(attackerEffects);
            log.append(
                String.format("%s took 15 burn damage. ", attacker.username())
            );
        }

        if (attackerHp <= 0) {
            return createRecord(
                turnNumber,
                attacker,
                defender,
                attackerHp,
                defenderHp,
                0,
                attackerEffects,
                defenderEffects,
                log.toString()
            );
        }

        // 2. Check for SKIP_TURN effect
        if (attackerEffects.contains(StatusEffect.SKIP_TURN)) {
            attackerEffects.remove(StatusEffect.SKIP_TURN);
            log.append(
                String.format("%s's turn was skipped!", attacker.username())
            );
            return createRecord(
                turnNumber,
                attacker,
                defender,
                attackerHp,
                defenderHp,
                0,
                attackerEffects,
                defenderEffects,
                log.toString()
            );
        }

        // 3. Process weapon or utility action
        if (action.type() == ItemType.WEAPON) {
            defenderHp = processWeaponAction(
                action,
                attacker,
                attackerEffects,
                defenderHp,
                log
            );
            attackerEffects = combatProcessor.removeBlindnessEffect(
                attackerEffects
            );
        } else {
            defenderHp = processUtilityAction(
                action,
                attacker,
                defenderHp,
                defenderEffects,
                log
            );
            defenderEffects = combatProcessor.applyStatusEffect(
                action,
                defenderEffects
            );
        }

        return createRecord(
            turnNumber,
            attacker,
            defender,
            attackerHp,
            defenderHp,
            energySpent,
            attackerEffects,
            defenderEffects,
            log.toString()
        );
    }

    private int processWeaponAction(
        WeaponArchetype action,
        PlayerState attacker,
        Set<StatusEffect> attackerEffects,
        int defenderHp,
        StringBuilder log
    ) {
        int damage = combatProcessor.calculateDamage(action);
        boolean wasCritical = damage != action.damage();

        if (wasCritical) {
            log.append("CRITICAL HIT! ");
        }

        // Apply blindness penalty
        if (attackerEffects.contains(StatusEffect.BLIND_50)) {
            damage = combatProcessor.applyBlindnessPenalty(
                damage,
                attackerEffects
            );
            log.append(
                String.format(
                    "%s fired %s while blinded, dealing %d damage.",
                    attacker.username(),
                    action.name(),
                    damage
                )
            );
        } else {
            log.append(
                String.format(
                    "%s fired %s, dealing %d damage.",
                    attacker.username(),
                    action.name(),
                    damage
                )
            );
        }

        return Math.max(0, defenderHp - damage);
    }

    private int processUtilityAction(
        WeaponArchetype action,
        PlayerState attacker,
        int defenderHp,
        Set<StatusEffect> defenderEffects,
        StringBuilder log
    ) {
        int damage = action.damage();
        if (damage > 0) {
            defenderHp = Math.max(0, defenderHp - damage);
            log.append(
                String.format(
                    "%s used %s, dealing %d damage.",
                    attacker.username(),
                    action.name(),
                    damage
                )
            );
        } else {
            log.append(
                String.format("%s used %s.", attacker.username(), action.name())
            );
        }
        return defenderHp;
    }

    private CombatRoundRecord createRecord(
        int turn,
        PlayerState a,
        PlayerState b,
        int aHp,
        int bHp,
        int energy,
        Set<StatusEffect> aEff,
        Set<StatusEffect> bEff,
        String log
    ) {
        PlayerState newAttacker = new PlayerState(
            a.playerId(),
            a.username(),
            aHp,
            a.energy() - energy,
            a.hand(),
            aEff
        );
        PlayerState newDefender = new PlayerState(
            b.playerId(),
            b.username(),
            bHp,
            b.energy(),
            b.hand(),
            bEff
        );
        return new CombatRoundRecord(
            turn,
            newAttacker,
            newDefender,
            log,
            a.playerId()
        );
    }

    private WeaponArchetype selectByWeight(List<WeaponArchetype> pool) {
        int totalWeight = pool
            .stream()
            .mapToInt(WeaponArchetype::drawWeight)
            .sum();
        if (totalWeight == 0) return pool.get(random.nextInt(pool.size()));

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
}
