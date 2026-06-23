package dev.m4tt3o.minics.dto.match;

import dev.m4tt3o.minics.dto.WeaponArchetype;
import java.util.List;

public record MatchStateResponse(
    int round,
    String playerAStatus,
    String playerBStatus,
    String lastLog,
    String status,
    List<WeaponArchetype> playerHand,
    boolean isMyTurn,
    String playerAUsername,
    String playerBUsername
) {}
