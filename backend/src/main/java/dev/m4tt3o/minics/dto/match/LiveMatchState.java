package dev.m4tt3o.minics.dto.match;

import dev.m4tt3o.minics.dto.PlayerState;
import java.util.List;

public record LiveMatchState(
    int round,
    Long activePlayerId,
    PlayerState playerAState,
    PlayerState playerBState,
    List<String> textLogs
) {}
