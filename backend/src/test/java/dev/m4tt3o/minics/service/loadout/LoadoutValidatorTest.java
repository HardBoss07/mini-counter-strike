package dev.m4tt3o.minics.service.loadout;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.m4tt3o.minics.dto.ItemType;
import dev.m4tt3o.minics.support.TestFixtures;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class LoadoutValidatorTest {

    @Test
    void validateLoadout_acceptsValidThreeWeaponTwoUtilityLoadout() {
        List<dev.m4tt3o.minics.entity.UserWeaponInstance> loadout = List.of(
            TestFixtures.loadoutWeaponInstance(
                1L,
                "AK-47",
                ItemType.WEAPON,
                "T"
            ),
            TestFixtures.loadoutWeaponInstance(
                2L,
                "M4A4",
                ItemType.WEAPON,
                "T"
            ),
            TestFixtures.loadoutWeaponInstance(3L, "AWP", ItemType.WEAPON, "T"),
            TestFixtures.loadoutWeaponInstance(
                4L,
                "Molotov",
                ItemType.UTILITY,
                "ALL"
            ),
            TestFixtures.loadoutWeaponInstance(
                5L,
                "Smoke Grenade",
                ItemType.UTILITY,
                "ALL"
            )
        );

        assertThatCode(() ->
            LoadoutValidator.validateLoadout(loadout, "T")
        ).doesNotThrowAnyException();
    }

    @Test
    void validateLoadout_rejectsMoreThanFiveItems() {
        List<dev.m4tt3o.minics.entity.UserWeaponInstance> loadout =
            new ArrayList<>();
        for (long i = 1; i <= 6; i++) {
            loadout.add(
                TestFixtures.loadoutWeaponInstance(
                    i,
                    "Weapon " + i,
                    ItemType.WEAPON,
                    "ALL"
                )
            );
        }

        assertThatThrownBy(() -> LoadoutValidator.validateLoadout(loadout, "T"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("cannot exceed 5 items");
    }

    @Test
    void validateLoadout_rejectsFactionIncompatibleWeapon() {
        List<dev.m4tt3o.minics.entity.UserWeaponInstance> loadout = List.of(
            TestFixtures.loadoutWeaponInstance(
                1L,
                "M4A4",
                ItemType.WEAPON,
                "CT"
            ),
            TestFixtures.loadoutWeaponInstance(
                2L,
                "AK-47",
                ItemType.WEAPON,
                "T"
            ),
            TestFixtures.loadoutWeaponInstance(3L, "AWP", ItemType.WEAPON, "T"),
            TestFixtures.loadoutWeaponInstance(
                4L,
                "Molotov",
                ItemType.UTILITY,
                "ALL"
            ),
            TestFixtures.loadoutWeaponInstance(
                5L,
                "Smoke Grenade",
                ItemType.UTILITY,
                "ALL"
            )
        );

        assertThatThrownBy(() -> LoadoutValidator.validateLoadout(loadout, "T"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("cannot be used on T side");
    }

    @Test
    void validateLoadout_rejectsDuplicateBaseWeaponVariants() {
        List<dev.m4tt3o.minics.entity.UserWeaponInstance> loadout = List.of(
            TestFixtures.loadoutWeaponInstance(
                1L,
                "AK-47 | Slate",
                ItemType.WEAPON,
                "T"
            ),
            TestFixtures.loadoutWeaponInstance(
                2L,
                "AK-47 | Redline",
                ItemType.WEAPON,
                "T"
            ),
            TestFixtures.loadoutWeaponInstance(3L, "AWP", ItemType.WEAPON, "T"),
            TestFixtures.loadoutWeaponInstance(
                4L,
                "Molotov",
                ItemType.UTILITY,
                "ALL"
            ),
            TestFixtures.loadoutWeaponInstance(
                5L,
                "Smoke Grenade",
                ItemType.UTILITY,
                "ALL"
            )
        );

        assertThatThrownBy(() -> LoadoutValidator.validateLoadout(loadout, "T"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("one variant of AK-47");
    }

    @Test
    void validateLoadout_rejectsMoreThanThreeWeapons() {
        List<dev.m4tt3o.minics.entity.UserWeaponInstance> loadout = List.of(
            TestFixtures.loadoutWeaponInstance(
                1L,
                "AK-47",
                ItemType.WEAPON,
                "T"
            ),
            TestFixtures.loadoutWeaponInstance(
                2L,
                "M4A4",
                ItemType.WEAPON,
                "T"
            ),
            TestFixtures.loadoutWeaponInstance(3L, "AWP", ItemType.WEAPON, "T"),
            TestFixtures.loadoutWeaponInstance(
                4L,
                "Galil AR",
                ItemType.WEAPON,
                "T"
            ),
            TestFixtures.loadoutWeaponInstance(
                5L,
                "Molotov",
                ItemType.UTILITY,
                "ALL"
            )
        );

        assertThatThrownBy(() -> LoadoutValidator.validateLoadout(loadout, "T"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Maximum of 3 primary weapons");
    }

    @Test
    void validateLoadout_rejectsMoreThanTwoUtilities() {
        List<dev.m4tt3o.minics.entity.UserWeaponInstance> loadout = List.of(
            TestFixtures.loadoutWeaponInstance(
                1L,
                "AK-47",
                ItemType.WEAPON,
                "T"
            ),
            TestFixtures.loadoutWeaponInstance(
                2L,
                "M4A4",
                ItemType.WEAPON,
                "T"
            ),
            TestFixtures.loadoutWeaponInstance(
                3L,
                "Molotov",
                ItemType.UTILITY,
                "ALL"
            ),
            TestFixtures.loadoutWeaponInstance(
                4L,
                "Flashbang",
                ItemType.UTILITY,
                "ALL"
            ),
            TestFixtures.loadoutWeaponInstance(
                5L,
                "Smoke Grenade",
                ItemType.UTILITY,
                "ALL"
            )
        );

        assertThatThrownBy(() -> LoadoutValidator.validateLoadout(loadout, "T"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Maximum of 2 utility items");
    }
}
