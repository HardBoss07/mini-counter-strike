package dev.m4tt3o.mini_cs.service;

import dev.m4tt3o.mini_cs.dto.inventory.WeaponInstanceDTO;
import dev.m4tt3o.mini_cs.entity.User;
import dev.m4tt3o.mini_cs.repository.UserRepository;
import dev.m4tt3o.mini_cs.repository.UserWeaponInstanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Handles inventory-related operations such as fetching a user's weapon instances
 * and converting them to API-safe DTOs.
 */
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final UserWeaponInstanceRepository weaponInstanceRepository;
    private final UserRepository userRepository;

    /**
     * Retrieves all weapon instances owned by the given user, mapped to flat DTOs.
     *
     * @param username the authenticated user's username
     * @return list of {@link WeaponInstanceDTO} with full weapon details and applied modifiers
     */
    public List<WeaponInstanceDTO> getWeaponsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        return weaponInstanceRepository.findByUser(user).stream()
                .map(WeaponInstanceDTO::fromEntity)
                .toList();
    }
}
