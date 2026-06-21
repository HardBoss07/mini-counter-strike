package dev.m4tt3o.minics.dto;

import java.util.List;
import java.util.Set;

/**
 * Immutable record representing the state of a player during a match turn.
 */
public record PlayerState(
    Long playerId,
    String username,
    int hp,
    int energy,
    List<WeaponArchetype> hand,
    Set<StatusEffect> activeEffects
) {}
