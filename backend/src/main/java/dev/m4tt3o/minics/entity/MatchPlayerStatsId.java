package dev.m4tt3o.minics.entity;

import java.io.Serializable;
import java.util.Objects;

public class MatchPlayerStatsId implements Serializable {

    private Long matchId;
    private Long userId;

    public MatchPlayerStatsId() {}

    public MatchPlayerStatsId(Long matchId, Long userId) {
        this.matchId = matchId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MatchPlayerStatsId that)) return false;
        return Objects.equals(matchId, that.matchId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(matchId, userId);
    }

    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
