package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.dto.economy.OpenCaseResponse;
import dev.m4tt3o.minics.dto.inventory.UserCaseInstanceDTO;
import dev.m4tt3o.minics.dto.inventory.WeaponInstanceDTO;
import java.util.List;

/**
 * Handles inventory-related operations such as fetching a user's weapon instances
 * and converting them to API-safe DTOs.
 */
public interface InventoryService {
    /**
     * Retrieves all weapon instances owned by the given user.
     */
    List<WeaponInstanceDTO> getWeaponsForUser(String username);

    /**
     * Retrieves all case instances owned by the given user.
     */
    List<UserCaseInstanceDTO> getUserCases(String username);

    /**
     * Opens a specific case owned by the user.
     */
    OpenCaseResponse openCase(Long userId, Long userCaseInstanceId);
}
