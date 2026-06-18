package dev.m4tt3o.mini_cs.dto;

/**
 * Immutable record representing a weapon or utility item's stats.
 */
public record WeaponArchetype(
    Long id,
    String name,
    ItemType type,
    String side,
    int energyCost,
    int damage,
    int drawWeight,
    double critChance,
    double critMultiplier,
    String statusEffect,
    String imageUrl,
    String description
) {}
