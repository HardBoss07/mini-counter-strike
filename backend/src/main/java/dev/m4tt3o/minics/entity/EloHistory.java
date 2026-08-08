package dev.m4tt3o.minics.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "elo_history")
public class EloHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id")
    private Match match;

    @Column(name = "elo_before", nullable = false)
    private Integer eloBefore;

    @Column(name = "elo_after", nullable = false)
    private Integer eloAfter;

    @Column(name = "elo_change", nullable = false)
    private Integer eloChange;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt = LocalDateTime.now();

    public EloHistory() {}

    public EloHistory(User user, Match match, Integer eloBefore, Integer eloAfter, Integer eloChange) {
        this.user = user;
        this.match = match;
        this.eloBefore = eloBefore;
        this.eloAfter = eloAfter;
        this.eloChange = eloChange;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Match getMatch() {
        return match;
    }

    public void setMatch(Match match) {
        this.match = match;
    }

    public Integer getEloBefore() {
        return eloBefore;
    }

    public void setEloBefore(Integer eloBefore) {
        this.eloBefore = eloBefore;
    }

    public Integer getEloAfter() {
        return eloAfter;
    }

    public void setEloAfter(Integer eloAfter) {
        this.eloAfter = eloAfter;
    }

    public Integer getEloChange() {
        return eloChange;
    }

    public void setEloChange(Integer eloChange) {
        this.eloChange = eloChange;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}
