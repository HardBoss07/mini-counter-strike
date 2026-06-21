package dev.m4tt3o.minics.dto;

/**
 * Immutable record representing a single turn's resolution in combat.
 */
public record CombatRoundRecord(
    int turnNumber,
    PlayerState playerA,
    PlayerState playerB,
    String actionLog,
    Long actingPlayerId
) {}
