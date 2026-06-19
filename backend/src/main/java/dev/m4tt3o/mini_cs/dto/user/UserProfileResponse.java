package dev.m4tt3o.mini_cs.dto.user;

public record UserProfileResponse(Long id, String username, int elo, int credits, int caseCount) {}
