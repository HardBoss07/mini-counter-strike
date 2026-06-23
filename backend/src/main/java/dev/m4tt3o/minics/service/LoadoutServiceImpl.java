package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.dto.ItemType;
import dev.m4tt3o.minics.entity.*;
import dev.m4tt3o.minics.repository.*;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LoadoutServiceImpl implements LoadoutService {

    private final LoadoutRepository loadoutRepository;
    private final UserRepository userRepository;
    private final UserWeaponInstanceRepository weaponInstanceRepository;

    @Override
    @Transactional
    public void saveFullLoadout(
        String username,
        List<Long> tLoadoutIds,
        List<Long> ctLoadoutIds
    ) {
        User user = userRepository
            .findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        updateSideLoadout(user, "T", tLoadoutIds);
        updateSideLoadout(user, "CT", ctLoadoutIds);
    }

    private void updateSideLoadout(
        User user,
        String side,
        List<Long> weaponInstanceIds
    ) {
        // Validation: Frontend sends up to 5 items total
        if (weaponInstanceIds.size() > 5) {
            throw new RuntimeException("Loadout cannot exceed 5 items total.");
        }

        Loadout loadout = loadoutRepository
            .findByUserAndSide(user, side.toUpperCase())
            .orElseGet(() -> {
                Loadout l = new Loadout();
                l.setUser(user);
                l.setSide(side.toUpperCase());
                return loadoutRepository.save(l);
            });

        // Fetch all distinct records from the DB matching requested IDs
        List<UserWeaponInstance> fetchedInstances =
            weaponInstanceRepository.findAllById(weaponInstanceIds);

        // Map them by ID for O(1) matching inside loops
        Map<Long, UserWeaponInstance> instanceMap = fetchedInstances
            .stream()
            .collect(
                Collectors.toMap(UserWeaponInstance::getId, Function.identity())
            );

        long weaponCount = 0;
        long utilityCount = 0;

        // Clear existing database junction items cleanly
        loadout.getItems().clear();

        for (Long weaponId : weaponInstanceIds) {
            UserWeaponInstance inst = instanceMap.get(weaponId);
            if (inst == null) {
                throw new RuntimeException(
                    "Weapon instance " + weaponId + " not found."
                );
            }

            // Faction Validation
            String weaponSide = inst.getTemplate().getSide();
            if (
                !"ALL".equalsIgnoreCase(weaponSide) &&
                !side.equalsIgnoreCase(weaponSide)
            ) {
                throw new RuntimeException(
                    "Weapon " +
                        inst.getTemplate().getName() +
                        " cannot be used on " +
                        side +
                        " side."
                );
            }

            // Type Counting Logic (Fixed to use your ItemType Enum)
            ItemType type = inst.getTemplate().getType();
            if (type == ItemType.WEAPON) {
                weaponCount++;
            } else if (type == ItemType.UTILITY) {
                utilityCount++;
            }

            // Safe add to Hibernate Set
            loadout.getItems().add(inst);
        }

        // Validate final slots arrangement matches game design rules
        if (weaponCount > 3) {
            throw new RuntimeException(
                "Validation Error: Maximum of 3 primary weapons allowed."
            );
        }
        if (utilityCount > 2) {
            throw new RuntimeException(
                "Validation Error: Maximum of 2 utility items allowed."
            );
        }

        loadoutRepository.save(loadout);
    }

    @Override
    @Transactional
    public Loadout assignWeapon(
        Long userId,
        String side,
        int slot,
        Long userWeaponInstanceId
    ) {
        User user = userRepository
            .findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        UserWeaponInstance weaponInstance = weaponInstanceRepository
            .findById(userWeaponInstanceId)
            .orElseThrow(() ->
                new RuntimeException("Weapon instance not found")
            );

        String weaponSide = weaponInstance.getTemplate().getSide();
        if (
            !"ALL".equalsIgnoreCase(weaponSide) &&
            !side.equalsIgnoreCase(weaponSide)
        ) {
            throw new RuntimeException(
                String.format(
                    "Cannot add %s weapon (%s) to %s loadout",
                    weaponSide,
                    weaponInstance.getTemplate().getName(),
                    side
                )
            );
        }

        Loadout loadout = loadoutRepository
            .findByUserAndSide(user, side.toUpperCase())
            .orElseGet(() -> {
                Loadout newLoadout = new Loadout();
                newLoadout.setUser(user);
                newLoadout.setSide(side.toUpperCase());
                return newLoadout;
            });

        loadout.getItems().add(weaponInstance);
        return loadoutRepository.save(loadout);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, java.util.Set<UserWeaponInstance>> getFullLoadout(
        String username
    ) {
        User user = userRepository
            .findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch T side loadout items (defaulting to empty Set if none exists yet)
        java.util.Set<UserWeaponInstance> tItems = loadoutRepository
            .findByUserAndSide(user, "T")
            .map(Loadout::getItems)
            .orElse(java.util.Collections.emptySet());

        // Fetch CT side loadout items
        java.util.Set<UserWeaponInstance> ctItems = loadoutRepository
            .findByUserAndSide(user, "CT")
            .map(Loadout::getItems)
            .orElse(java.util.Collections.emptySet());

        return Map.of("tLoadout", tItems, "ctLoadout", ctItems);
    }
}
