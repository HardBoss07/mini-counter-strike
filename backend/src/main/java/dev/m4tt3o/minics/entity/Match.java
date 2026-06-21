package dev.m4tt3o.minics.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * State of a match between two users.
 */
@Entity
@Table(name = "match_state")
@Getter
@Setter
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "player_a_id")
    private User playerA;

    @ManyToOne
    @JoinColumn(name = "player_b_id")
    private User playerB;

    @Column(nullable = false)
    private String status; // IN_PROGRESS, COMPLETED

    @ManyToOne
    @JoinColumn(name = "winner_id")
    private User winner;

    @Lob
    @Column(name = "logs_json", columnDefinition = "TEXT")
    private String logsJson;

    private LocalDateTime createdAt = LocalDateTime.now();
}
