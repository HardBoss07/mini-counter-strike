package dev.m4tt3o.mini_cs.dto;

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
