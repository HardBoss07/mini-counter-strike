package dev.m4tt3o.mini_cs.engine;

import dev.m4tt3o.mini_cs.dto.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

/**
 * Core engine for tactical game mechanics.
 */
@Component
public class MatchEngine {

    private final Random random = new Random();

    /**
     * Draws exactly 3 items from a 5-item loadout based on their draw weights.
     */
    public List<WeaponArchetype> drawHand(List<WeaponArchetype> loadout) {
        if (loadout.size() != 5) {
            throw new IllegalArgumentException("Loadout must contain exactly 5 items.");
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
     * Resolves a single combat turn including status effects and critical hits.
     */
    public CombatRoundRecord resolveTurn(PlayerState attacker, PlayerState defender, WeaponArchetype action, int turnNumber) {
        StringBuilder log = new StringBuilder();
        Set<StatusEffect> attackerEffects = new HashSet<>(attacker.activeEffects());
        Set<StatusEffect> defenderEffects = new HashSet<>(defender.activeEffects());
        
        int attackerHp = attacker.hp();
        int defenderHp = defender.hp();
        int energySpent = 0;

        // 1. Start of Turn: Check for BURN_15
        if (attackerEffects.contains(StatusEffect.BURN_15)) {
            attackerHp = Math.max(0, attackerHp - 15);
            attackerEffects.remove(StatusEffect.BURN_15);
            log.append(String.format("%s took 15 burn damage. ", attacker.username()));
        }

        // 2. Check for SKIP_TURN
        if (attackerEffects.contains(StatusEffect.SKIP_TURN)) {
            attackerEffects.remove(StatusEffect.SKIP_TURN);
            log.append(String.format("%s's turn was skipped due to smoke!", attacker.username()));
            return createRecord(turnNumber, attacker, defender, attackerHp, defenderHp, 0, attackerEffects, defenderEffects, log.toString());
        }

        // 3. Process Action
        energySpent = action.energyCost();
        if (action.type() == ItemType.WEAPON) {
            int damage = action.damage();
            
            // Check for Critical Hit
            if (random.nextDouble() <= action.critChance()) {
                damage = (int) (damage * action.critMultiplier());
                log.append("CRITICAL HIT! ");
            }

            // Check for Blindness
            if (attackerEffects.contains(StatusEffect.BLIND_50)) {
                damage /= 2;
                attackerEffects.remove(StatusEffect.BLIND_50);
                log.append(String.format("%s fired %s while blinded, dealing %d damage.", attacker.username(), action.name(), damage));
            } else {
                log.append(String.format("%s fired %s, dealing %d damage.", attacker.username(), action.name(), damage));
            }
            defenderHp = Math.max(0, defenderHp - damage);
        } else {
            // Utility Action
            int damage = action.damage();
            if (damage > 0) {
                defenderHp = Math.max(0, defenderHp - damage);
                log.append(String.format("%s used %s, dealing %d damage.", attacker.username(), action.name(), damage));
            } else {
                log.append(String.format("%s used %s.", attacker.username(), action.name()));
            }

            // Apply Status Effect to Defender
            if (!"NONE".equals(action.statusEffect())) {
                try {
                    StatusEffect effect = StatusEffect.valueOf(action.statusEffect());
                    defenderEffects.add(effect);
                } catch (IllegalArgumentException e) {
                    // Ignore invalid status effects
                }
            }
        }

        return createRecord(turnNumber, attacker, defender, attackerHp, defenderHp, energySpent, attackerEffects, defenderEffects, log.toString());
    }

    private CombatRoundRecord createRecord(int turn, PlayerState a, PlayerState b, int aHp, int bHp, int energy, Set<StatusEffect> aEff, Set<StatusEffect> bEff, String log) {
        PlayerState newAttacker = new PlayerState(a.playerId(), a.username(), aHp, a.energy() - energy, a.hand(), aEff);
        PlayerState newDefender = new PlayerState(b.playerId(), b.username(), bHp, b.energy(), b.hand(), bEff);
        return new CombatRoundRecord(turn, newAttacker, newDefender, log, a.playerId());
    }

    private WeaponArchetype selectByWeight(List<WeaponArchetype> pool) {
        int totalWeight = pool.stream().mapToInt(WeaponArchetype::drawWeight).sum();
        int r = random.nextInt(totalWeight);
        int current = 0;

        for (WeaponArchetype item : pool) {
            current += item.drawWeight();
            if (r < current) {
                return item;
            }
        }
        return pool.get(0);
    }
}
