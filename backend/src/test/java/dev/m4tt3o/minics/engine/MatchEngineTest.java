package dev.m4tt3o.minics.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.m4tt3o.minics.dto.CombatRoundRecord;
import dev.m4tt3o.minics.dto.ItemType;
import dev.m4tt3o.minics.dto.PlayerState;
import dev.m4tt3o.minics.dto.StatusEffect;
import dev.m4tt3o.minics.dto.WeaponArchetype;
import dev.m4tt3o.minics.support.ControllableRandom;
import dev.m4tt3o.minics.support.TestFixtures;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MatchEngineTest {

    private CombatMechanicsProcessor combatProcessor;
    private MatchEngine matchEngine;

    @BeforeEach
    void setUp() {
        combatProcessor = new CombatMechanicsProcessor(
            new ControllableRandom()
        );
        matchEngine = new MatchEngine(
            ControllableRandom.withInts(0),
            combatProcessor
        );
    }

    @Test
    void drawHand_rejectsLoadoutThatIsNotExactlyFiveItems() {
        List<WeaponArchetype> loadout = List.of(TestFixtures.rifle(1L));

        assertThatThrownBy(() -> matchEngine.drawHand(loadout))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("exactly 5 items");
    }

    @Test
    void drawHand_returnsThreeItemsFromLoadout() {
        List<WeaponArchetype> loadout = TestFixtures.standardLoadout();
        matchEngine = new MatchEngine(
            ControllableRandom.withInts(0, 0, 0),
            combatProcessor
        );

        List<WeaponArchetype> hand = matchEngine.drawHand(loadout);

        assertThat(hand).hasSize(3);
        assertThat(loadout).containsAll(hand);
    }

    @Test
    void drawHand_usesUniformSelectionWhenTotalWeightIsZero() {
        List<WeaponArchetype> loadout = List.of(
            TestFixtures.weapon(
                1L,
                "A",
                ItemType.WEAPON,
                1,
                10,
                0,
                0,
                1,
                "NONE"
            ),
            TestFixtures.weapon(
                2L,
                "B",
                ItemType.WEAPON,
                1,
                10,
                0,
                0,
                1,
                "NONE"
            ),
            TestFixtures.weapon(
                3L,
                "C",
                ItemType.WEAPON,
                1,
                10,
                0,
                0,
                1,
                "NONE"
            ),
            TestFixtures.weapon(
                4L,
                "D",
                ItemType.WEAPON,
                1,
                10,
                0,
                0,
                1,
                "NONE"
            ),
            TestFixtures.weapon(
                5L,
                "E",
                ItemType.WEAPON,
                1,
                10,
                0,
                0,
                1,
                "NONE"
            )
        );
        matchEngine = new MatchEngine(
            ControllableRandom.withInts(0, 1, 2),
            combatProcessor
        );

        List<WeaponArchetype> hand = matchEngine.drawHand(loadout);

        assertThat(hand).hasSize(3);
        assertThat(loadout).containsAll(hand);
        assertThat(hand).doesNotHaveDuplicates();
    }

    @Test
    void resolveTurn_appliesWeaponDamageToDefender() {
        WeaponArchetype rifle = TestFixtures.rifle(1L);
        PlayerState attacker = TestFixtures.playerState(
            1L,
            "Alpha",
            100,
            rifle
        );
        PlayerState defender = TestFixtures.playerState(2L, "Bravo", 100);

        CombatRoundRecord record = matchEngine.resolveTurn(
            attacker,
            defender,
            rifle,
            1
        );

        assertThat(record.playerA().hp()).isEqualTo(100);
        assertThat(record.playerB().hp()).isEqualTo(70);
        assertThat(record.actionLog()).contains("dealing 30 damage");
    }

    @Test
    void resolveTurn_appliesUtilityDamageAndStatusEffect() {
        WeaponArchetype molotov = TestFixtures.molotov(1L);
        PlayerState attacker = TestFixtures.playerState(
            1L,
            "Alpha",
            100,
            molotov
        );
        PlayerState defender = TestFixtures.playerState(2L, "Bravo", 100);

        CombatRoundRecord record = matchEngine.resolveTurn(
            attacker,
            defender,
            molotov,
            1
        );

        assertThat(record.playerB().hp()).isEqualTo(90);
        assertThat(record.playerB().activeEffects()).contains(
            StatusEffect.BURN_15
        );
        assertThat(record.actionLog()).contains("used Molotov");
    }

    @Test
    void resolveTurn_skipsTurnWhenSkipEffectPresent() {
        WeaponArchetype rifle = TestFixtures.rifle(1L);
        PlayerState attacker = TestFixtures.playerState(
            1L,
            "Alpha",
            100,
            10,
            List.of(rifle),
            Set.of(StatusEffect.SKIP_TURN)
        );
        PlayerState defender = TestFixtures.playerState(2L, "Bravo", 100);

        CombatRoundRecord record = matchEngine.resolveTurn(
            attacker,
            defender,
            rifle,
            1
        );

        assertThat(record.playerA().energy()).isEqualTo(10);
        assertThat(record.playerB().hp()).isEqualTo(100);
        assertThat(record.actionLog()).contains("turn was skipped");
    }

    @Test
    void resolveTurn_appliesBlindnessPenaltyToWeaponDamage() {
        WeaponArchetype rifle = TestFixtures.rifle(1L);
        PlayerState attacker = TestFixtures.playerState(
            1L,
            "Alpha",
            100,
            10,
            List.of(rifle),
            Set.of(StatusEffect.BLIND_50)
        );
        PlayerState defender = TestFixtures.playerState(2L, "Bravo", 100);

        CombatRoundRecord record = matchEngine.resolveTurn(
            attacker,
            defender,
            rifle,
            1
        );

        assertThat(record.playerB().hp()).isEqualTo(85);
        assertThat(record.actionLog()).contains("while blinded");
    }

    @Test
    void shouldTerminateTurnWhenBurnKillsAttackerBeforeAction() {
        WeaponArchetype rifle = TestFixtures.rifle(99L);
        PlayerState attacker = TestFixtures.playerState(
            2L,
            "Bravo",
            12,
            10,
            List.of(rifle),
            Set.of(StatusEffect.BURN_15)
        );
        PlayerState defender = TestFixtures.playerState(1L, "Alpha", 100);

        CombatRoundRecord record = matchEngine.resolveTurn(
            attacker,
            defender,
            rifle,
            3
        );

        assertThat(record.playerA().hp()).isZero();
        assertThat(record.playerB().hp()).isEqualTo(100);
        assertThat(record.playerA().activeEffects()).doesNotContain(
            StatusEffect.BURN_15
        );
        assertThat(record.actionLog()).contains("15 burn damage");
        assertThat(record.playerA().energy()).isEqualTo(10);
    }

    @Test
    void resolveTurn_continuesTurnWhenBurnIsNonLethal() {
        WeaponArchetype rifle = TestFixtures.rifle(99L);
        PlayerState attacker = TestFixtures.playerState(
            2L,
            "Bravo",
            40,
            10,
            List.of(rifle),
            Set.of(StatusEffect.BURN_15)
        );
        PlayerState defender = TestFixtures.playerState(1L, "Alpha", 100);

        CombatRoundRecord record = matchEngine.resolveTurn(
            attacker,
            defender,
            rifle,
            3
        );

        assertThat(record.playerA().hp()).isEqualTo(25);
        assertThat(record.playerB().hp()).isEqualTo(70);
        assertThat(record.actionLog()).contains("15 burn damage");
        assertThat(record.actionLog()).contains("dealing 30 damage");
    }

    @Test
    void simulateMatch_terminatesWhenDefenderHpReachesZero() {
        matchEngine = new MatchEngine(
            ControllableRandom.withInts(0, 0, 0),
            new CombatMechanicsProcessor(ControllableRandom.withDoubles(1.0))
        );

        WeaponArchetype lethal = TestFixtures.weapon(
            1L,
            "AWP",
            ItemType.WEAPON,
            1,
            100,
            100,
            0.0,
            1.0,
            "NONE"
        );
        List<WeaponArchetype> loadout = List.of(
            lethal,
            lethal,
            lethal,
            lethal,
            lethal
        );

        PlayerState p1 = TestFixtures.playerState(
            1L,
            "Alpha",
            100,
            10,
            loadout,
            Set.of()
        );
        PlayerState p2 = TestFixtures.playerState(
            2L,
            "Bravo",
            100,
            10,
            loadout,
            Set.of()
        );

        List<CombatRoundRecord> logs = matchEngine.simulateMatch(
            p1,
            loadout,
            p2,
            loadout
        );

        assertThat(logs).isNotEmpty();
        CombatRoundRecord last = logs.get(logs.size() - 1);
        assertThat(
            last.playerA().hp() <= 0 || last.playerB().hp() <= 0
        ).isTrue();
    }
}
