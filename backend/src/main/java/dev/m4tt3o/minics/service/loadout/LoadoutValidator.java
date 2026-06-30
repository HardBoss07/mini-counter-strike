package dev.m4tt3o.minics.service.loadout;

import dev.m4tt3o.minics.dto.ItemType;
import dev.m4tt3o.minics.entity.UserWeaponInstance;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Encapsulates all loadout validation logic.
 * Validates faction compatibility, item type limits, and duplicate weapons.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class LoadoutValidator {

    private static final int MAX_TOTAL_ITEMS = 5;
    private static final int MAX_WEAPONS = 3;
    private static final int MAX_UTILITY = 2;

    /**
     * Validates that loadout respects all game design constraints.
     */
    public static void validateLoadout(
        List<UserWeaponInstance> weapons,
        String side
    ) {
        validateLoadoutSize(weapons);
        validateFactionCompatibility(weapons, side);
        validateWeaponDuplicates(weapons);
        validateItemCounting(weapons);
    }

    /**
     * Ensures loadout does not exceed maximum item count.
     */
    private static void validateLoadoutSize(List<UserWeaponInstance> weapons) {
        if (weapons.size() > MAX_TOTAL_ITEMS) {
            throw new IllegalArgumentException(
                "Loadout cannot exceed " +
                    MAX_TOTAL_ITEMS +
                    " items total. Provided: " +
                    weapons.size()
            );
        }
    }

    /**
     * Validates all weapons are compatible with the target side.
     */
    private static void validateFactionCompatibility(
        List<UserWeaponInstance> weapons,
        String side
    ) {
        for (UserWeaponInstance inst : weapons) {
            String weaponSide = inst.getTemplate().getSide();
            if (
                !"ALL".equalsIgnoreCase(weaponSide) &&
                !side.equalsIgnoreCase(weaponSide)
            ) {
                throw new IllegalArgumentException(
                    "Weapon " +
                        inst.getTemplate().getName() +
                        " cannot be used on " +
                        side +
                        " side."
                );
            }
        }
    }

    /**
     * Ensures no duplicate weapon variants (e.g., two AK-47 skins).
     */
    private static void validateWeaponDuplicates(
        List<UserWeaponInstance> weapons
    ) {
        Set<String> equippedBaseWeapons = new HashSet<>();

        for (UserWeaponInstance inst : weapons) {
            String fullName = inst.getTemplate().getName();
            String baseName = fullName.split(" \\| ")[0]; // Extracts "AK-47" from "AK-47 | Slate"

            if (!equippedBaseWeapons.add(baseName)) {
                throw new IllegalArgumentException(
                    "Validation Error: You can only equip one variant of " +
                        baseName +
                        " per loadout."
                );
            }
        }
    }

    /**
     * Validates weapon vs utility item count constraints.
     */
    private static void validateItemCounting(List<UserWeaponInstance> weapons) {
        long weaponCount = weapons
            .stream()
            .filter(w -> w.getTemplate().getType() == ItemType.WEAPON)
            .count();
        long utilityCount = weapons
            .stream()
            .filter(w -> w.getTemplate().getType() == ItemType.UTILITY)
            .count();

        if (weaponCount > MAX_WEAPONS) {
            throw new IllegalArgumentException(
                "Validation Error: Maximum of " +
                    MAX_WEAPONS +
                    " primary weapons allowed. Provided: " +
                    weaponCount
            );
        }
        if (utilityCount > MAX_UTILITY) {
            throw new IllegalArgumentException(
                "Validation Error: Maximum of " +
                    MAX_UTILITY +
                    " utility items allowed. Provided: " +
                    utilityCount
            );
        }
    }
}
