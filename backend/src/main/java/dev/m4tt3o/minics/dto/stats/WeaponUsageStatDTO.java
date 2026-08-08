package dev.m4tt3o.minics.dto.stats;

public record WeaponUsageStatDTO(
    Long templateId,
    String weaponName,
    String imageUrl,
    Long totalTimesUsed,
    Long totalDamageDealt,
    Long totalKills,
    Long totalCritsLanded
) {}
