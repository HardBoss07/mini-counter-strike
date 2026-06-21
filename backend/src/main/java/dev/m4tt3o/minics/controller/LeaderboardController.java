package dev.m4tt3o.minics.controller;

import dev.m4tt3o.minics.dto.leaderboard.LeaderboardEntry;
import dev.m4tt3o.minics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard() {
        // Assuming user entity has getElo()
        return ResponseEntity.ok(userRepository.findAll().stream()
                .map(user -> new LeaderboardEntry(user.getUsername(), 1000))
                .collect(Collectors.toList()));
    }
}
