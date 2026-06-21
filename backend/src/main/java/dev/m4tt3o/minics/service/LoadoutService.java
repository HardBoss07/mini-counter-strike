package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.entity.Loadout;
import dev.m4tt3o.minics.entity.UserWeaponInstance;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Service for managing user loadouts and enforcing side restrictions.
 */
public interface LoadoutService {
    /**
     * Assigns a weapon to a specific slot in a user's loadout with validation.
     */
    Loadout assignWeapon(Long userId, String side, int slot, Long userWeaponInstanceId);

    /**
     * Replaces user's full loadout items.
     */
    void saveFullLoadout(String username, List<Long> tLoadoutIds, List<Long> ctLoadoutIds);

    /**
     * Retrieves the complete T and CT loadouts for a user.
     */
    Map<String, Set<UserWeaponInstance>> getFullLoadout(String username);
}
