package dev.m4tt3o.minics.dto.stats;

public record PlayerStatsSummaryDTO(
    Long userId,
    Integer matchesPlayed,
    Integer matchesWon,
    Integer matchesLost,
    Integer matchesDrawn,
    Double winRate,
    Integer totalKills,
    Integer totalDeaths,
    Double kdRatio,
    Long totalDamageDealt,
    Long totalDamageTaken,
    Integer totalCritsLanded,
    Integer casesOpened,
    String favoriteWeaponName,
    String favoriteWeaponImageUrl
) {}
