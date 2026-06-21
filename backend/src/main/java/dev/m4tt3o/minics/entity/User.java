package dev.m4tt3o.minics.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * User account information for authentication and progression.
 */
@Entity
@Table(name = "app_user")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    private int elo = 1000;

    private int credits = 0;
}
