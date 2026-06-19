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

    public Long queueUser(Long userId) {
        matchmakingQueue.add(userId);
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
    public void tryMatchmaking() {
        if (matchmakingQueue.size() >= 2) {
            Long playerAId = matchmakingQueue.poll();
            Long playerBId = matchmakingQueue.poll();
            
            Match match = new Match();
            match.setPlayerA(userRepository.findById(playerAId).orElseThrow());
            match.setPlayerB(userRepository.findById(playerBId).orElseThrow());
            match.setStatus("ACTIVE");
            Match savedMatch = matchRepository.save(match);
            
            ticketToMatch.put(playerAId, savedMatch.getId());
            ticketToMatch.put(playerBId, savedMatch.getId());
        }
    }
}
