package dev.m4tt3o.minics.controller;

import dev.m4tt3o.minics.dto.user.UserProfileResponse;
import dev.m4tt3o.minics.entity.User;
import dev.m4tt3o.minics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMe() {
        String username = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
        User user = userRepository
            .findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Assuming user entity has these fields
        return ResponseEntity.ok(
            new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                1000,
                100,
                5
            )
        );
    }
}
