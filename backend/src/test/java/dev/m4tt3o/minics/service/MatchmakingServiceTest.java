package dev.m4tt3o.minics.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.m4tt3o.minics.entity.Match;
import dev.m4tt3o.minics.entity.User;
import dev.m4tt3o.minics.repository.MatchRepository;
import dev.m4tt3o.minics.repository.UserRepository;
import dev.m4tt3o.minics.support.TestFixtures;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MatchmakingServiceTest {

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MatchService matchService;

    @InjectMocks
    private MatchmakingService matchmakingService;

    private User playerA;
    private User playerB;

    @BeforeEach
    void setUp() {
        playerA = TestFixtures.user(1L, "Alpha");
        playerB = TestFixtures.user(2L, "Bravo");
    }

    @Test
    void queueUser_addsUserToQueue() {
        Long ticket = matchmakingService.queueUser(1L);

        assertThat(ticket).isEqualTo(1L);
        assertThat(matchmakingService.getStatus(1L)).isEqualTo("WAITING");
    }

    @Test
    void queueUser_returnsEarlyWhenActiveMatchTicketExists() {
        Match activeMatch = new Match();
        activeMatch.setId(99L);
        activeMatch.setStatus("IN_PROGRESS");

        when(userRepository.findById(1L)).thenReturn(Optional.of(playerA));
        when(userRepository.findById(2L)).thenReturn(Optional.of(playerB));
        when(matchService.createMatch("Alpha", "Bravo")).thenAnswer(inv -> {
            Match match = new Match();
            match.setId(99L);
            match.setStatus("IN_PROGRESS");
            return match;
        });

        matchmakingService.queueUser(1L);
        matchmakingService.queueUser(2L);
        matchmakingService.tryMatchmaking();

        when(matchRepository.findById(99L)).thenReturn(
            Optional.of(activeMatch)
        );

        Long ticket = matchmakingService.queueUser(1L);

        assertThat(ticket).isEqualTo(1L);
        assertThat(matchmakingService.getStatus(1L)).isEqualTo("MATCH_FOUND");
    }

    @Test
    void leaveQueue_removesUserFromQueue() {
        matchmakingService.queueUser(1L);

        matchmakingService.leaveQueue(1L);

        assertThat(matchmakingService.getStatus(1L)).isEqualTo("WAITING");
    }

    @Test
    void getStatus_returnsMatchFoundForActiveTicket() {
        Match activeMatch = new Match();
        activeMatch.setId(42L);
        activeMatch.setStatus("IN_PROGRESS");

        when(userRepository.findById(1L)).thenReturn(Optional.of(playerA));
        when(userRepository.findById(2L)).thenReturn(Optional.of(playerB));
        when(matchService.createMatch("Alpha", "Bravo")).thenAnswer(inv -> {
            Match match = new Match();
            match.setId(42L);
            match.setStatus("IN_PROGRESS");
            return match;
        });

        matchmakingService.queueUser(1L);
        matchmakingService.queueUser(2L);
        matchmakingService.tryMatchmaking();

        when(matchRepository.findById(42L)).thenReturn(
            Optional.of(activeMatch)
        );

        assertThat(matchmakingService.getStatus(1L)).isEqualTo("MATCH_FOUND");
        assertThat(matchmakingService.getMatchId(1L)).isEqualTo(42L);
    }

    @Test
    void getStatus_cleansStaleTicketWhenMatchIsNoLongerActive() {
        Match completedMatch = new Match();
        completedMatch.setId(42L);
        completedMatch.setStatus("COMPLETED");

        when(userRepository.findById(1L)).thenReturn(Optional.of(playerA));
        when(userRepository.findById(2L)).thenReturn(Optional.of(playerB));
        when(matchService.createMatch(anyString(), anyString())).thenAnswer(
            inv -> {
                Match match = new Match();
                match.setId(42L);
                match.setStatus("IN_PROGRESS");
                return match;
            }
        );

        matchmakingService.queueUser(1L);
        matchmakingService.queueUser(2L);
        matchmakingService.tryMatchmaking();

        when(matchRepository.findById(42L)).thenReturn(
            Optional.of(completedMatch)
        );

        assertThat(matchmakingService.getStatus(1L)).isEqualTo("WAITING");
        assertThat(matchmakingService.getMatchId(1L)).isNull();
    }

    @Test
    void tryMatchmaking_pairsTwoUsersAndCreatesMatch() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(playerA));
        when(userRepository.findById(2L)).thenReturn(Optional.of(playerB));
        when(matchService.createMatch("Alpha", "Bravo")).thenAnswer(inv -> {
            Match match = new Match();
            match.setId(100L);
            match.setStatus("IN_PROGRESS");
            return match;
        });

        matchmakingService.queueUser(1L);
        matchmakingService.queueUser(2L);
        matchmakingService.tryMatchmaking();

        verify(matchService).createMatch("Alpha", "Bravo");
        assertThat(matchmakingService.getMatchId(1L)).isEqualTo(100L);
        assertThat(matchmakingService.getMatchId(2L)).isEqualTo(100L);
    }

    @Test
    void tryMatchmaking_doesNotPairSingleUser() {
        matchmakingService.queueUser(1L);

        matchmakingService.tryMatchmaking();

        verify(matchService, never()).createMatch(anyString(), anyString());
    }
}
