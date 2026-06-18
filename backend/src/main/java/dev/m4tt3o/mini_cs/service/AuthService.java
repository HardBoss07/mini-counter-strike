package dev.m4tt3o.mini_cs.service;

/**
 * Service for handling user authentication and registration.
 */
public interface AuthService {
    /**
     * Registers a new user and provisions starter items.
     */
    String register(String username, String password);

    /**
     * Authenticates a user and returns a JWT token.
     */
    String login(String username, String password);
}
