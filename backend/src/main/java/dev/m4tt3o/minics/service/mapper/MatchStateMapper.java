package dev.m4tt3o.minics.service.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.m4tt3o.minics.dto.match.LiveMatchState;
import dev.m4tt3o.minics.entity.Match;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Handles serialization and deserialization of match state to/from JSON.
 * Separates persistence concerns from business logic.
 */
@Component
@RequiredArgsConstructor
public class MatchStateMapper {

    private final ObjectMapper objectMapper;

    public LiveMatchState deserialize(String logsJson) {
        try {
            return objectMapper.readValue(logsJson, LiveMatchState.class);
        } catch (Exception e) {
            throw new RuntimeException(
                "Failed to deserialize match state: " + e.getMessage(),
                e
            );
        }
    }

    public String serialize(LiveMatchState state) {
        try {
            return objectMapper.writeValueAsString(state);
        } catch (Exception e) {
            throw new RuntimeException(
                "Failed to serialize match state: " + e.getMessage(),
                e
            );
        }
    }

    public LiveMatchState readFromMatch(Match match) {
        if (match.getLogsJson() == null) {
            throw new IllegalStateException(
                "Match does not have a valid state stored"
            );
        }
        return deserialize(match.getLogsJson());
    }

    public void writeToMatch(Match match, LiveMatchState state) {
        match.setLogsJson(serialize(state));
    }
}
