package dev.m4tt3o.minics.dto.user;

public record UserProfileResponse(
    Long id,
    String username,
    int elo,
    int credits,
    int caseCount
) {}
