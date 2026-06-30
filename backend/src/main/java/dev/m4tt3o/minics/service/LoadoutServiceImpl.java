package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.entity.*;
import dev.m4tt3o.minics.repository.*;
import dev.m4tt3o.minics.service.loadout.LoadoutValidator;
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
        // Fetch all weapon instances by ID
        List<UserWeaponInstance> fetchedInstances =
            weaponInstanceRepository.findAllById(weaponInstanceIds);

        // Validate all constraints upfront
        LoadoutValidator.validateLoadout(fetchedInstances, side);

        // Build or retrieve loadout
        Loadout loadout = loadoutRepository
            .findByUserAndSide(user, side.toUpperCase())
            .orElseGet(() -> {
                Loadout l = new Loadout();
                l.setUser(user);
                l.setSide(side.toUpperCase());
                return loadoutRepository.save(l);
            });

        // Replace items
        loadout.getItems().clear();
        loadout.getItems().addAll(fetchedInstances);
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

        // Validate faction compatibility
        String weaponSide = weaponInstance.getTemplate().getSide();
        if (
            !"ALL".equalsIgnoreCase(weaponSide) &&
            !side.equalsIgnoreCase(weaponSide)
        ) {
            throw new IllegalArgumentException(
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
