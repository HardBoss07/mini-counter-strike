package dev.m4tt3o.mini_cs.service;

import dev.m4tt3o.mini_cs.entity.Loadout;
import dev.m4tt3o.mini_cs.entity.UserWeaponInstance;
import java.util.List;

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
}
