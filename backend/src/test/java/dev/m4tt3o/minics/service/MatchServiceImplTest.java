package dev.m4tt3o.minics.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.m4tt3o.minics.config.GameConfig;
import dev.m4tt3o.minics.dto.PlayerState;
import dev.m4tt3o.minics.dto.StatusEffect;
import dev.m4tt3o.minics.dto.WeaponArchetype;
import dev.m4tt3o.minics.dto.match.LiveMatchState;
import dev.m4tt3o.minics.engine.CombatMechanicsProcessor;
import dev.m4tt3o.minics.engine.MatchEngine;
import dev.m4tt3o.minics.entity.Loadout;
import dev.m4tt3o.minics.entity.Match;
import dev.m4tt3o.minics.entity.User;
import dev.m4tt3o.minics.repository.LoadoutRepository;
import dev.m4tt3o.minics.repository.MatchRepository;
import dev.m4tt3o.minics.repository.UserRepository;
import dev.m4tt3o.minics.service.combat.CombatRoundProcessor;
import dev.m4tt3o.minics.service.mapper.MatchStateMapper;
import dev.m4tt3o.minics.support.ControllableRandom;
import dev.m4tt3o.minics.support.TestFixtures;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MatchServiceImplTest {

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LoadoutRepository loadoutRepository;

    @Mock
    private MatchStateMapper matchStateMapper;

    private GameConfig gameConfig;
    private MatchServiceImpl matchService;

    private User playerA;
    private User playerB;
    private Match match;

    @BeforeEach
    void setUp() {
        gameConfig = new GameConfig();
        ControllableRandom random = new ControllableRandom();
        CombatMechanicsProcessor combatProcessor = new CombatMechanicsProcessor(
            random
        );
        MatchEngine matchEngine = new MatchEngine(random, combatProcessor);
        CombatRoundProcessor combatRoundProcessor = new CombatRoundProcessor(
            matchEngine,
            gameConfig,
            loadoutRepository
        );
        matchService = new MatchServiceImpl(
            matchRepository,
            userRepository,
            loadoutRepository,
            matchEngine,
            gameConfig,
            matchStateMapper,
            combatRoundProcessor
        );

        playerA = TestFixtures.user(1L, "Alpha");
        playerB = TestFixtures.user(2L, "Bravo");

        match = new Match();
        match.setId(10L);
        match.setPlayerA(playerA);
        match.setPlayerB(playerB);
        match.setStatus("IN_PROGRESS");
    }

    @Test
    void submitAction_rejectsActionWhenItIsNotPlayersTurn() {
        WeaponArchetype rifle = TestFixtures.rifle(10L);
        LiveMatchState state = TestFixtures.liveMatchState(
            1,
            1L,
            true,
            TestFixtures.playerState(1L, "Alpha", 100, rifle),
            TestFixtures.playerState(2L, "Bravo", 100, rifle)
        );

        when(matchRepository.findById(10L)).thenReturn(Optional.of(match));
        when(matchStateMapper.readFromMatch(match)).thenReturn(state);
        when(userRepository.findByUsername("Bravo")).thenReturn(
            Optional.of(playerB)
        );

        assertThatThrownBy(() -> matchService.submitAction(10L, "Bravo", 10L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("not your strategic turn");
    }

    @Test
    void submitAction_rejectsActionWhenMatchHasConcluded() {
        match.setStatus("COMPLETED");

        when(matchRepository.findById(10L)).thenReturn(Optional.of(match));

        assertThatThrownBy(() -> matchService.submitAction(10L, "Alpha", 10L))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Match has concluded");
    }

    @Test
    void shouldEndMatchWhenDirectDamageKillsDefender() {
        WeaponArchetype lethalRifle = TestFixtures.weapon(
            10L,
            "AWP",
            dev.m4tt3o.minics.dto.ItemType.WEAPON,
            1,
            100,
            50,
            0.0,
            1.0,
            "NONE"
        );
        LiveMatchState state = TestFixtures.liveMatchState(
            1,
            1L,
            true,
            TestFixtures.playerState(1L, "Alpha", 100, lethalRifle),
            TestFixtures.playerState(2L, "Bravo", 20)
        );

        stubLoadout(playerA, "T");
        when(matchRepository.findById(10L)).thenReturn(Optional.of(match));
        when(matchRepository.save(any(Match.class))).thenAnswer(inv ->
            inv.getArgument(0)
        );
        when(matchStateMapper.readFromMatch(match)).thenReturn(state);
        when(userRepository.findByUsername("Alpha")).thenReturn(
            Optional.of(playerA)
        );

        matchService.submitAction(10L, "Alpha", 10L);

        ArgumentCaptor<Match> matchCaptor = ArgumentCaptor.forClass(
            Match.class
        );
        verify(matchRepository).save(matchCaptor.capture());

        Match saved = matchCaptor.getValue();
        assertThat(saved.getStatus()).isEqualTo("COMPLETED");
        assertThat(saved.getWinner()).isEqualTo(playerA);
    }

    @Test
    void shouldEndMatchWhenBurnEffectKillsOpponentPostTurn() {
        WeaponArchetype rifle = TestFixtures.rifle(20L);
        PlayerState burnVictim = TestFixtures.playerState(
            2L,
            "Bravo",
            12,
            10,
            List.of(rifle),
            Set.of(StatusEffect.BURN_15)
        );
        LiveMatchState state = TestFixtures.liveMatchState(
            2,
            2L,
            true,
            TestFixtures.playerState(1L, "Alpha", 100),
            burnVictim
        );

        stubLoadout(playerB, "CT");
        when(matchRepository.findById(10L)).thenReturn(Optional.of(match));
        when(matchRepository.save(any(Match.class))).thenAnswer(inv ->
            inv.getArgument(0)
        );
        when(matchStateMapper.readFromMatch(match)).thenReturn(state);
        when(userRepository.findByUsername("Bravo")).thenReturn(
            Optional.of(playerB)
        );

        matchService.submitAction(10L, "Bravo", 20L);

        ArgumentCaptor<Match> matchCaptor = ArgumentCaptor.forClass(
            Match.class
        );
        verify(matchRepository).save(matchCaptor.capture());

        Match saved = matchCaptor.getValue();
        assertThat(saved.getStatus()).isEqualTo("COMPLETED");
        assertThat(saved.getWinner()).isEqualTo(playerA);
    }

    @Test
    void surrenderMatch_setsOpponentAsWinnerAndZerosSurrenderingHp() {
        WeaponArchetype rifle = TestFixtures.rifle(10L);
        LiveMatchState state = TestFixtures.liveMatchState(
            1,
            1L,
            true,
            TestFixtures.playerState(1L, "Alpha", 100, rifle),
            TestFixtures.playerState(2L, "Bravo", 100, rifle)
        );

        when(matchRepository.findById(10L)).thenReturn(Optional.of(match));
        when(matchRepository.save(any(Match.class))).thenAnswer(inv ->
            inv.getArgument(0)
        );
        when(matchStateMapper.readFromMatch(match)).thenReturn(state);

        matchService.surrenderMatch(10L, "Alpha");

        ArgumentCaptor<Match> matchCaptor = ArgumentCaptor.forClass(
            Match.class
        );
        verify(matchRepository).save(matchCaptor.capture());
        verify(matchStateMapper).writeToMatch(
            eq(match),
            any(LiveMatchState.class)
        );

        Match saved = matchCaptor.getValue();
        assertThat(saved.getStatus()).isEqualTo("COMPLETED");
        assertThat(saved.getWinner()).isEqualTo(playerB);
    }

    private void stubLoadout(User user, String side) {
        Loadout loadout = new Loadout();
        loadout.setItems(
            new HashSet<>(
                List.of(
                    TestFixtures.loadoutWeaponInstance(
                        10L,
                        "AK-47",
                        dev.m4tt3o.minics.dto.ItemType.WEAPON,
                        side
                    ),
                    TestFixtures.loadoutWeaponInstance(
                        11L,
                        "Molotov",
                        dev.m4tt3o.minics.dto.ItemType.UTILITY,
                        "ALL"
                    ),
                    TestFixtures.loadoutWeaponInstance(
                        20L,
                        "AWP",
                        dev.m4tt3o.minics.dto.ItemType.WEAPON,
                        side
                    )
                )
            )
        );
        when(loadoutRepository.findByUserAndSide(user, side)).thenReturn(
            Optional.of(loadout)
        );
    }
}
