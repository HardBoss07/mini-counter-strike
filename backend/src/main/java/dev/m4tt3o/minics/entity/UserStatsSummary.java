package dev.m4tt3o.minics.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_stats_summary")
public class UserStatsSummary {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private Integer matchesPlayed = 0;
    private Integer matchesWon = 0;
    private Integer matchesLost = 0;
    private Integer matchesDrawn = 0;
    private Integer totalKills = 0;
    private Integer totalDeaths = 0;
    private Long totalDamageDealt = 0L;
    private Long totalDamageTaken = 0L;
    private Integer totalCritsLanded = 0;
    private Integer casesOpened = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "favorite_weapon_template_id")
    private WeaponTemplate favoriteWeaponTemplate;

    private LocalDateTime updatedAt = LocalDateTime.now();

    public UserStatsSummary() {}

    public UserStatsSummary(User user) {
        this.user = user;
        // this.userId = user.getId(); !!! DON'T CHANGE !!!
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getMatchesPlayed() {
        return matchesPlayed;
    }

    public void setMatchesPlayed(Integer matchesPlayed) {
        this.matchesPlayed = matchesPlayed;
    }

    public Integer getMatchesWon() {
        return matchesWon;
    }

    public void setMatchesWon(Integer matchesWon) {
        this.matchesWon = matchesWon;
    }

    public Integer getMatchesLost() {
        return matchesLost;
    }

    public void setMatchesLost(Integer matchesLost) {
        this.matchesLost = matchesLost;
    }

    public Integer getMatchesDrawn() {
        return matchesDrawn;
    }

    public void setMatchesDrawn(Integer matchesDrawn) {
        this.matchesDrawn = matchesDrawn;
    }

    public Integer getTotalKills() {
        return totalKills;
    }

    public void setTotalKills(Integer totalKills) {
        this.totalKills = totalKills;
    }

    public Integer getTotalDeaths() {
        return totalDeaths;
    }

    public void setTotalDeaths(Integer totalDeaths) {
        this.totalDeaths = totalDeaths;
    }

    public Long getTotalDamageDealt() {
        return totalDamageDealt;
    }

    public void setTotalDamageDealt(Long totalDamageDealt) {
        this.totalDamageDealt = totalDamageDealt;
    }

    public Long getTotalDamageTaken() {
        return totalDamageTaken;
    }

    public void setTotalDamageTaken(Long totalDamageTaken) {
        this.totalDamageTaken = totalDamageTaken;
    }

    public Integer getTotalCritsLanded() {
        return totalCritsLanded;
    }

    public void setTotalCritsLanded(Integer totalCritsLanded) {
        this.totalCritsLanded = totalCritsLanded;
    }

    public Integer getCasesOpened() {
        return casesOpened;
    }

    public void setCasesOpened(Integer casesOpened) {
        this.casesOpened = casesOpened;
    }

    public WeaponTemplate getFavoriteWeaponTemplate() {
        return favoriteWeaponTemplate;
    }

    public void setFavoriteWeaponTemplate(WeaponTemplate favoriteWeaponTemplate) {
        this.favoriteWeaponTemplate = favoriteWeaponTemplate;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
