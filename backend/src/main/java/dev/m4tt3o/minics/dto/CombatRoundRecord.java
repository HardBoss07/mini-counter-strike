package dev.m4tt3o.minics.dto;

/**
 * Immutable record representing a single turn's resolution in combat.
 *
 * <p>{@code energySpent} - energy consumed by the acting player this turn.
 * {@code remainingEnergy} - the acting player's energy balance after deduction.
 */
public record CombatRoundRecord(
    int turnNumber,
    PlayerState playerA,
    PlayerState playerB,
    String actionLog,
    Long actingPlayerId,
    int energySpent,
    int remainingEnergy
) {
    /** Compact constructor - energy bookkeeping values must be non-negative. */
    public CombatRoundRecord {
        if (energySpent < 0) {
            throw new IllegalArgumentException(
                "energySpent cannot be negative, got: " + energySpent
            );
        }
        if (remainingEnergy < 0) {
            throw new IllegalArgumentException(
                "remainingEnergy cannot be negative, got: " + remainingEnergy
            );
        }
    }
}
