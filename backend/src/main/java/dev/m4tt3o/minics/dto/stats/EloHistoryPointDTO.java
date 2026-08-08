package dev.m4tt3o.minics.dto.stats;

import java.time.LocalDateTime;

public record EloHistoryPointDTO(
    Long id,
    Long matchId,
    Integer eloBefore,
    Integer eloAfter,
    Integer eloChange,
    LocalDateTime recordedAt
) {}
