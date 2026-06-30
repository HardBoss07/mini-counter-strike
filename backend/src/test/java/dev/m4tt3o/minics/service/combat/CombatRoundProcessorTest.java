package dev.m4tt3o.minics.service.combat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import dev.m4tt3o.minics.config.GameConfig;
import dev.m4tt3o.minics.dto.ItemType;
import dev.m4tt3o.minics.dto.PlayerState;
import dev.m4tt3o.minics.dto.StatusEffect;
import dev.m4tt3o.minics.dto.WeaponArchetype;
import dev.m4tt3o.minics.dto.match.LiveMatchState;
import dev.m4tt3o.minics.engine.CombatMechanicsProcessor;
import dev.m4tt3o.minics.engine.MatchEngine;
import dev.m4tt3o.minics.entity.Loadout;
import dev.m4tt3o.minics.entity.User;
import dev.m4tt3o.minics.repository.LoadoutRepository;
import dev.m4tt3o.minics.support.ControllableRandom;
import dev.m4tt3o.minics.support.TestFixtures;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CombatRoundProcessorTest {

    @Mock
    private LoadoutRepository loadoutRepository;

    private CombatRoundProcessor combatRoundProcessor;

    private User alpha;
    private User bravo;
    private WeaponArchetype rifle;
    private WeaponArchetype molotov;

    @BeforeEach
    void setUp() {
        GameConfig gameConfig = new GameConfig();
        MatchEngine matchEngine = new MatchEngine(
            new ControllableRandom(),
            new CombatMechanicsProcessor(new ControllableRandom())
        );
        combatRoundProcessor = new CombatRoundProcessor(
            matchEngine,
            gameConfig,
            loadoutRepository
        );

        alpha = TestFixtures.user(1L, "Alpha");
        bravo = TestFixtures.user(2L, "Bravo");
        rifle = TestFixtures.rifle(10L);
        molotov = TestFixtures.molotov(11L);
    }

    @Test
    void processTurn_throwsWhenWeaponNotInHand() {
        LiveMatchState state = TestFixtures.liveMatchState(
            1,
            1L,
            true,
            TestFixtures.playerState(1L, "Alpha", 100, rifle),
            TestFixtures.playerState(2L, "Bravo", 100)
        );

        assertThatThrownBy(() ->
            combatRoundProcessor.processTurn(state, alpha, 999L, "T")
        )
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Weapon not in current hand");
    }

    @Test
    void processTurn_delegatesToEngineAndReplenishesHand() {
        PlayerState attacker = TestFixtures.playerState(
            1L,
            "Alpha",
            100,
            rifle
        );
        PlayerState defender = TestFixtures.playerState(2L, "Bravo", 100);
        LiveMatchState state = TestFixtures.liveMatchState(
            1,
            1L,
            true,
            attacker,
            defender
        );

        Loadout loadout = new Loadout();
        loadout.setItems(
            new HashSet<>(
                List.of(
                    TestFixtures.loadoutWeaponInstance(
                        10L,
                        "AK-47",
                        ItemType.WEAPON,
                        "T"
                    ),
                    TestFixtures.loadoutWeaponInstance(
                        11L,
                        "Molotov",
                        ItemType.UTILITY,
                        "ALL"
                    )
                )
            )
        );
        when(loadoutRepository.findByUserAndSide(alpha, "T")).thenReturn(
            Optional.of(loadout)
        );

        var result = combatRoundProcessor.processTurn(state, alpha, 10L, "T");

        assertThat(result.newAttacker().hp()).isEqualTo(100);
        assertThat(result.newDefender().hp()).isEqualTo(70);
        assertThat(result.newAttacker().hand()).hasSize(1);
        assertThat(result.newAttacker().hand().get(0).id()).isIn(10L, 11L);
        assertThat(result.actionLog()).contains("dealing 30 damage");
    }

    @Test
    void resolveNextActivePlayer_keepsTurnOnAttackerForUtility() {
        PlayerState attacker = TestFixtures.playerState(1L, "Alpha", 100);
        PlayerState defender = TestFixtures.playerState(2L, "Bravo", 100);
        LiveMatchState state = TestFixtures.liveMatchState(
            1,
            1L,
            true,
            attacker,
            defender
        );

        Long next = combatRoundProcessor.resolveNextActivePlayer(
            attacker,
            defender,
            molotov,
            state
        );

        assertThat(next).isEqualTo(1L);
    }

    @Test
    void resolveNextActivePlayer_keepsTurnOnAttackerWhenDefenderHasSkipTurn() {
        PlayerState attacker = TestFixtures.playerState(1L, "Alpha", 100);
        PlayerState defender = TestFixtures.playerState(
            2L,
            "Bravo",
            100,
            10,
            List.of(),
            Set.of(StatusEffect.SKIP_TURN)
        );
        LiveMatchState state = TestFixtures.liveMatchState(
            1,
            1L,
            true,
            attacker,
            defender
        );

        Long next = combatRoundProcessor.resolveNextActivePlayer(
            attacker,
            defender,
            rifle,
            state
        );

        assertThat(next).isEqualTo(1L);
    }

    @Test
    void resolveNextActivePlayer_passesTurnToDefenderForWeaponAction() {
        PlayerState attacker = TestFixtures.playerState(1L, "Alpha", 100);
        PlayerState defender = TestFixtures.playerState(2L, "Bravo", 100);
        LiveMatchState state = TestFixtures.liveMatchState(
            1,
            1L,
            true,
            attacker,
            defender
        );

        Long next = combatRoundProcessor.resolveNextActivePlayer(
            attacker,
            defender,
            rifle,
            state
        );

        assertThat(next).isEqualTo(2L);
    }

    @Test
    void applySkipTurnPenalty_clearsSkipTurnEffect() {
        PlayerState defender = TestFixtures.playerState(
            2L,
            "Bravo",
            100,
            10,
            List.of(),
            Set.of(StatusEffect.SKIP_TURN)
        );
        LiveMatchState state = TestFixtures.liveMatchState(
            1,
            1L,
            true,
            TestFixtures.playerState(1L, "Alpha", 100),
            defender
        );

        PlayerState updated = combatRoundProcessor.applySkipTurnPenalty(
            defender,
            state
        );

        assertThat(updated.activeEffects()).isEmpty();
    }

    @Test
    void applySkipTurnPenalty_returnsUnchangedDefenderWithoutSkipTurn() {
        PlayerState defender = TestFixtures.playerState(2L, "Bravo", 100);
        LiveMatchState state = TestFixtures.liveMatchState(
            1,
            1L,
            true,
            TestFixtures.playerState(1L, "Alpha", 100),
            defender
        );

        PlayerState updated = combatRoundProcessor.applySkipTurnPenalty(
            defender,
            state
        );

        assertThat(updated).isEqualTo(defender);
    }
}
