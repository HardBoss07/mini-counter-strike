package dev.m4tt3o.minics.engine;

import static org.assertj.core.api.Assertions.assertThat;

import dev.m4tt3o.minics.dto.ItemType;
import dev.m4tt3o.minics.dto.StatusEffect;
import dev.m4tt3o.minics.dto.WeaponArchetype;
import dev.m4tt3o.minics.support.ControllableRandom;
import dev.m4tt3o.minics.support.TestFixtures;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class CombatMechanicsProcessorTest {

    @Test
    void calculateDamage_returnsBaseDamageWhenCritChanceIsZero() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            ControllableRandom.withDoubles(0.0)
        );
        WeaponArchetype weapon = TestFixtures.rifle(1L);

        assertThat(processor.calculateDamage(weapon)).isEqualTo(30);
    }

    @Test
    void calculateDamage_appliesCritMultiplierWhenRollSucceeds() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            ControllableRandom.withDoubles(0.0)
        );
        WeaponArchetype weapon = TestFixtures.weapon(
            1L,
            "AWP",
            ItemType.WEAPON,
            5,
            80,
            10,
            1.0,
            2.0,
            "NONE"
        );

        assertThat(processor.calculateDamage(weapon)).isEqualTo(160);
    }

    @Test
    void calculateDamage_returnsBaseDamageWhenRollFails() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            ControllableRandom.withDoubles(0.5)
        );
        WeaponArchetype weapon = TestFixtures.weapon(
            1L,
            "AWP",
            ItemType.WEAPON,
            5,
            80,
            10,
            0.1,
            2.0,
            "NONE"
        );

        assertThat(processor.calculateDamage(weapon)).isEqualTo(80);
    }

    @Test
    void applyStatusEffect_addsBurnEffectFromMolotov() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            new ControllableRandom()
        );
        WeaponArchetype molotov = TestFixtures.molotov(1L);

        Set<StatusEffect> result = processor.applyStatusEffect(
            molotov,
            Set.of()
        );

        assertThat(result).containsExactly(StatusEffect.BURN_15);
    }

    @Test
    void applyStatusEffect_addsBlindEffectFromFlashbang() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            new ControllableRandom()
        );
        WeaponArchetype flashbang = TestFixtures.flashbang(1L);

        Set<StatusEffect> result = processor.applyStatusEffect(
            flashbang,
            Set.of()
        );

        assertThat(result).containsExactly(StatusEffect.BLIND_50);
    }

    @Test
    void applyStatusEffect_ignoresNoneStatusEffect() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            new ControllableRandom()
        );
        WeaponArchetype rifle = TestFixtures.rifle(1L);

        Set<StatusEffect> result = processor.applyStatusEffect(
            rifle,
            Set.of(StatusEffect.BURN_15)
        );

        assertThat(result).containsExactly(StatusEffect.BURN_15);
    }

    @Test
    void applyStatusEffect_ignoresNullStatusEffect() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            new ControllableRandom()
        );
        WeaponArchetype weapon = TestFixtures.weapon(
            1L,
            "Decoy",
            ItemType.UTILITY,
            1,
            0,
            10,
            0.0,
            1.0,
            null
        );

        Set<StatusEffect> result = processor.applyStatusEffect(
            weapon,
            Set.of()
        );

        assertThat(result).isEmpty();
    }

    @Test
    void applyStatusEffect_ignoresInvalidStatusEffectString() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            new ControllableRandom()
        );
        WeaponArchetype weapon = TestFixtures.weapon(
            1L,
            "Broken",
            ItemType.UTILITY,
            1,
            0,
            10,
            0.0,
            1.0,
            "NOT_A_REAL_EFFECT"
        );

        Set<StatusEffect> result = processor.applyStatusEffect(
            weapon,
            Set.of()
        );

        assertThat(result).isEmpty();
    }

    @Test
    void applyBurnDamage_reducesHpByFifteenWhenBurned() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            new ControllableRandom()
        );

        assertThat(
            processor.applyBurnDamage(40, Set.of(StatusEffect.BURN_15))
        ).isEqualTo(25);
    }

    @Test
    void applyBurnDamage_floorsAtZero() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            new ControllableRandom()
        );

        assertThat(
            processor.applyBurnDamage(12, Set.of(StatusEffect.BURN_15))
        ).isZero();
    }

    @Test
    void applyBurnDamage_leavesHpUnchangedWithoutBurn() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            new ControllableRandom()
        );

        assertThat(processor.applyBurnDamage(40, Set.of())).isEqualTo(40);
    }

    @Test
    void removeBurnEffect_clearsBurnOnly() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            new ControllableRandom()
        );
        Set<StatusEffect> effects = new HashSet<>(
            Set.of(StatusEffect.BURN_15, StatusEffect.BLIND_50)
        );

        Set<StatusEffect> result = processor.removeBurnEffect(effects);

        assertThat(result).containsExactly(StatusEffect.BLIND_50);
    }

    @Test
    void applyBlindnessPenalty_halvesDamageWhenBlinded() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            new ControllableRandom()
        );

        assertThat(
            processor.applyBlindnessPenalty(31, Set.of(StatusEffect.BLIND_50))
        ).isEqualTo(15);
    }

    @Test
    void applyBlindnessPenalty_leavesDamageUnchangedWhenNotBlinded() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            new ControllableRandom()
        );

        assertThat(processor.applyBlindnessPenalty(31, Set.of())).isEqualTo(31);
    }

    @Test
    void removeBlindnessEffect_clearsBlindOnly() {
        CombatMechanicsProcessor processor = new CombatMechanicsProcessor(
            new ControllableRandom()
        );
        Set<StatusEffect> effects = new HashSet<>(
            Set.of(StatusEffect.BURN_15, StatusEffect.BLIND_50)
        );

        Set<StatusEffect> result = processor.removeBlindnessEffect(effects);

        assertThat(result).containsExactly(StatusEffect.BURN_15);
    }
}
