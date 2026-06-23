package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.entity.Match;
import dev.m4tt3o.minics.entity.User;
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

    public Long queueUser(Long userId) {
        ticketToMatch.remove(userId);

        if (!matchmakingQueue.contains(userId)) {
            matchmakingQueue.add(userId);
        }
        return userId;
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
