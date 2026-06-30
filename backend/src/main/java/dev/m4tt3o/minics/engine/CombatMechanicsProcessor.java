package dev.m4tt3o.minics.engine;

import dev.m4tt3o.minics.dto.StatusEffect;
import dev.m4tt3o.minics.dto.WeaponArchetype;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Handles status effect application and damage calculation with critical hits.
 * Separates combat mechanics from turn orchestration.
 */
@Component
@RequiredArgsConstructor
public class CombatMechanicsProcessor {

    private final Random random;

    /**
     * Calculates total damage output including critical hit chance.
     */
    public int calculateDamage(WeaponArchetype weapon) {
        int baseDamage = weapon.damage();

        // Check for critical hit
        if (random.nextDouble() <= weapon.critChance()) {
            return (int) (baseDamage * weapon.critMultiplier());
        }

        return baseDamage;
    }

    /**
     * Applies status effect from a utility weapon to defender.
     */
    public Set<StatusEffect> applyStatusEffect(
        WeaponArchetype weapon,
        Set<StatusEffect> defenderEffects
    ) {
        Set<StatusEffect> updatedEffects = new HashSet<>(defenderEffects);

        if (
            weapon.statusEffect() == null ||
            "NONE".equalsIgnoreCase(weapon.statusEffect())
        ) {
            return updatedEffects;
        }

        try {
            StatusEffect effect = StatusEffect.valueOf(weapon.statusEffect());
            updatedEffects.add(effect);
        } catch (IllegalArgumentException e) {
            // Ignore invalid status effects
        }

        return updatedEffects;
    }

    /**
     * Applies BURN_15 damage at start of turn.
     */
    public int applyBurnDamage(int currentHp, Set<StatusEffect> effects) {
        if (effects.contains(StatusEffect.BURN_15)) {
            return Math.max(0, currentHp - 15);
        }
        return currentHp;
    }

    /**
     * Checks and removes BURN_15 effect.
     */
    public Set<StatusEffect> removeBurnEffect(Set<StatusEffect> effects) {
        Set<StatusEffect> updated = new HashSet<>(effects);
        updated.remove(StatusEffect.BURN_15);
        return updated;
    }

    /**
     * Applies blindness penalty to damage (50% reduction).
     */
    public int applyBlindnessPenalty(int damage, Set<StatusEffect> effects) {
        if (effects.contains(StatusEffect.BLIND_50)) {
            return damage / 2;
        }
        return damage;
    }

    /**
     * Checks and removes BLIND_50 effect.
     */
    public Set<StatusEffect> removeBlindnessEffect(Set<StatusEffect> effects) {
        Set<StatusEffect> updated = new HashSet<>(effects);
        updated.remove(StatusEffect.BLIND_50);
        return updated;
    }
}
