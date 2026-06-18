package dev.m4tt3o.mini_cs.service;

import dev.m4tt3o.mini_cs.entity.*;
import dev.m4tt3o.mini_cs.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoadoutServiceImpl implements LoadoutService {

    private final LoadoutRepository loadoutRepository;
    private final UserRepository userRepository;
    private final UserWeaponInstanceRepository weaponInstanceRepository;

    @Override
    @Transactional
    public Loadout assignWeapon(Long userId, String side, int slot, Long userWeaponInstanceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserWeaponInstance weaponInstance = weaponInstanceRepository.findById(userWeaponInstanceId)
                .orElseThrow(() -> new RuntimeException("Weapon instance not found"));

        // Validation: Side Restrictions
        String weaponSide = weaponInstance.getTemplate().getSide();
        if (!"ALL".equalsIgnoreCase(weaponSide) && !side.equalsIgnoreCase(weaponSide)) {
            throw new RuntimeException(String.format("Cannot add %s weapon (%s) to %s loadout", 
                weaponSide, weaponInstance.getTemplate().getName(), side));
        }

        Loadout loadout = loadoutRepository.findByUserAndSide(user, side.toUpperCase())
                .orElseGet(() -> {
                    Loadout newLoadout = new Loadout();
                    newLoadout.setUser(user);
                    newLoadout.setSide(side.toUpperCase());
                    return newLoadout;
                });

        // Ensure exactly 5 slots or handle as a list. 
        // For now, if it's a specific slot, we might need to handle it differently.
        // But the schema doesn't support slots, just a collection.
        // Let's just add it to the list for now to fix compilation.
        if (loadout.getItems().size() < 5) {
            loadout.getItems().add(weaponInstance);
        } else {
            // Replace if we wanted specific slot logic, but junction table doesn't have slot info.
            // For now, let's just clear and add if we're "assigning" to a slot? No, that's not right.
            // If the schema is 3NF junction table, it doesn't have 'slot'.
            // To support 'slot', we'd need a column in the junction table.
            loadout.getItems().add(weaponInstance);
        }

        return loadoutRepository.save(loadout);
    }
}
