package dev.m4tt3o.mini_cs.service;

import dev.m4tt3o.mini_cs.entity.Match;
import dev.m4tt3o.mini_cs.entity.User;
import dev.m4tt3o.mini_cs.repository.MatchRepository;
import dev.m4tt3o.mini_cs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@RequiredArgsConstructor
public class MatchmakingService {

    private final ConcurrentLinkedQueue<Long> matchmakingQueue = new ConcurrentLinkedQueue<>();
    private final Map<Long, Long> ticketToMatch = new ConcurrentHashMap<>();
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final MatchService matchService;

    public Long queueUser(Long userId) {
        if (!matchmakingQueue.contains(userId) && !ticketToMatch.containsKey(userId)) {
            matchmakingQueue.add(userId);
        }
        return userId; // Using userId as ticketId for simplicity
    }

    public String getStatus(Long ticketId) {
        if (ticketToMatch.containsKey(ticketId)) {
            return "MATCH_FOUND";
        }
        return "WAITING";
    }

    public Long getMatchId(Long ticketId) {
        return ticketToMatch.get(ticketId);
    }

    // This would be called by a background task or in status check
    // Synchronized to prevent race conditions when multiple users hit /queue concurrently
    public synchronized void tryMatchmaking() {
        while (matchmakingQueue.size() >= 2) {
            Long playerAId = matchmakingQueue.poll();
            Long playerBId = matchmakingQueue.poll();

            // Safety check in case the queue state changes unexpectedly
            if (playerAId == null || playerBId == null) {
                if (playerAId != null) matchmakingQueue.add(playerAId);
                if (playerBId != null) matchmakingQueue.add(playerBId);
                break;
            }

            // Prevent self-matching
            if (playerAId.equals(playerBId)) {
                matchmakingQueue.add(playerAId);
                continue;
            }
            
            Match match = new Match();
            match.setPlayerA(userRepository.findById(playerAId).orElseThrow());
            match.setPlayerB(userRepository.findById(playerBId).orElseThrow());
            match.setStatus("ACTIVE");
            Match savedMatch = matchRepository.save(match);

            // Run simulation
            matchService.simulateAndSaveMatch(savedMatch);
            
            ticketToMatch.put(playerAId, savedMatch.getId());
            ticketToMatch.put(playerBId, savedMatch.getId());
        }
    }
}
