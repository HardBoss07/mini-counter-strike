package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.entity.Match;
import dev.m4tt3o.minics.repository.MatchRepository;
import dev.m4tt3o.minics.repository.UserRepository;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MatchmakingService {

    private final ConcurrentLinkedQueue<Long> matchmakingQueue =
        new ConcurrentLinkedQueue<>();
    private final Map<Long, Long> ticketToMatch = new ConcurrentHashMap<>();
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final MatchService matchService;

    public synchronized Long queueUser(Long userId) {
        // Safeguard against double-queues tearing down a freshly made match
        if (ticketToMatch.containsKey(userId)) {
            Long matchId = ticketToMatch.get(userId);

            // Check if the match they are attached to is actually ongoing
            boolean isActive = matchRepository
                .findById(matchId)
                .map(m -> "IN_PROGRESS".equals(m.getStatus()))
                .orElse(false);

            if (isActive) {
                return userId;
            }
        }

        // Safe to clean up stale tickets and add to the queue
        ticketToMatch.remove(userId);

        if (!matchmakingQueue.contains(userId)) {
            matchmakingQueue.add(userId);
        }
        return userId;
    }

    public synchronized void leaveQueue(Long userId) {
        matchmakingQueue.remove(userId);
    }

    public String getStatus(Long ticketId) {
        if (ticketToMatch.containsKey(ticketId)) {
            Long matchId = ticketToMatch.get(ticketId);

            return matchRepository
                .findById(matchId)
                .filter(m -> "IN_PROGRESS".equals(m.getStatus()))
                .map(m -> "MATCH_FOUND")
                .orElseGet(() -> {
                    ticketToMatch.remove(ticketId);
                    return "WAITING";
                });
        }
        return "WAITING";
    }

    public Long getMatchId(Long ticketId) {
        return ticketToMatch.get(ticketId);
    }

    public synchronized void tryMatchmaking() {
        while (matchmakingQueue.size() >= 2) {
            Long playerAId = matchmakingQueue.poll();
            Long playerBId = matchmakingQueue.poll();

            if (playerAId == null || playerBId == null) {
                if (playerAId != null) matchmakingQueue.add(playerAId);
                if (playerBId != null) matchmakingQueue.add(playerBId);
                break;
            }

            if (playerAId.equals(playerBId)) {
                matchmakingQueue.add(playerAId);
                continue;
            }

            // Generate the live match state using MatchService
            // instead of simulating the whole match to the end instantly
            Match liveMatch = matchService.createMatch(
                userRepository.findById(playerAId).orElseThrow().getUsername(),
                userRepository.findById(playerBId).orElseThrow().getUsername()
            );

            ticketToMatch.put(playerAId, liveMatch.getId());
            ticketToMatch.put(playerBId, liveMatch.getId());
        }
    }
}
