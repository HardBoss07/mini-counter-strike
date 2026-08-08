package dev.m4tt3o.minics.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "match_player_stats")
@IdClass(MatchPlayerStatsId.class)
public class MatchPlayerStats {

    @Id
    @Column(name = "match_id")
    private Long matchId;

    @Id
    @Column(name = "user_id")
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("matchId")
    @JoinColumn(name = "match_id")
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    private String side; // T, CT
    private Boolean isWinner = false;
    private Boolean isDraw = false;
    private Integer kills = 0;
    private Integer deaths = 0;
    private Integer damageDealt = 0;
    private Integer damageTaken = 0;
    private Integer critsLanded = 0;
    private Integer roundsWon = 0;
    private Integer roundsLost = 0;
    private Integer eloChange = 0;

    public MatchPlayerStats() {}

    // Getters and Setters
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

    public Match getMatch() {
        return match;
    }

    public void setMatch(Match match) {
        this.match = match;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getSide() {
        return side;
    }

    public void setSide(String side) {
        this.side = side;
    }

    public Boolean getIsWinner() {
        return isWinner;
    }

    public void setIsWinner(Boolean isWinner) {
        this.isWinner = isWinner;
    }

    public Boolean getIsDraw() {
        return isDraw;
    }

    public void setIsDraw(Boolean isDraw) {
        this.isDraw = isDraw;
    }

    public Integer getKills() {
        return kills;
    }

    public void setKills(Integer kills) {
        this.kills = kills;
    }

    public Integer getDeaths() {
        return deaths;
    }

    public void setDeaths(Integer deaths) {
        this.deaths = deaths;
    }

    public Integer getDamageDealt() {
        return damageDealt;
    }

    public void setDamageDealt(Integer damageDealt) {
        this.damageDealt = damageDealt;
    }

    public Integer getDamageTaken() {
        return damageTaken;
    }

    public void setDamageTaken(Integer damageTaken) {
        this.damageTaken = damageTaken;
    }

    public Integer getCritsLanded() {
        return critsLanded;
    }

    public void setCritsLanded(Integer critsLanded) {
        this.critsLanded = critsLanded;
    }

    public Integer getRoundsWon() {
        return roundsWon;
    }

    public void setRoundsWon(Integer roundsWon) {
        this.roundsWon = roundsWon;
    }

    public Integer getRoundsLost() {
        return roundsLost;
    }

    public void setRoundsLost(Integer roundsLost) {
        this.roundsLost = roundsLost;
    }

    public Integer getEloChange() {
        return eloChange;
    }

    public void setEloChange(Integer eloChange) {
        this.eloChange = eloChange;
    }
}
