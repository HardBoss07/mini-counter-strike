package dev.m4tt3o.mini_cs.service;

import dev.m4tt3o.mini_cs.entity.*;
import dev.m4tt3o.mini_cs.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoadoutServiceImpl implements LoadoutService {

    private final LoadoutRepository loadoutRepository;
    private final UserRepository userRepository;
    private final UserWeaponInstanceRepository weaponInstanceRepository;

    @Override
    @Transactional
    public void saveFullLoadout(String username, List<Long> tLoadoutIds, List<Long> ctLoadoutIds) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        updateSideLoadout(user, "T", tLoadoutIds);
        updateSideLoadout(user, "CT", ctLoadoutIds);
    }

    private void updateSideLoadout(User user, String side, List<Long> weaponInstanceIds) {
        if (weaponInstanceIds.size() != 5) throw new RuntimeException("Loadout must have exactly 5 items.");
        
        Loadout loadout = loadoutRepository.findByUserAndSide(user, side.toUpperCase())
            .orElseGet(() -> {
                Loadout l = new Loadout();
                l.setUser(user);
                l.setSide(side.toUpperCase());
                return loadoutRepository.save(l);
            });
        
        List<UserWeaponInstance> distinctInstances = weaponInstanceRepository.findAllById(weaponInstanceIds);
        
        loadout.getItems().clear();
        for (Long weaponId : weaponInstanceIds) {
            UserWeaponInstance inst = distinctInstances.stream()
                .filter(i -> i.getId().equals(weaponId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Weapon instance " + weaponId + " not found."));

            String weaponSide = inst.getTemplate().getSide();
            if (!"ALL".equalsIgnoreCase(weaponSide) && !side.equalsIgnoreCase(weaponSide)) {
                throw new RuntimeException("Weapon " + inst.getTemplate().getName() + " cannot be used on " + side + " side.");
            }
            
            loadout.getItems().add(inst);
        }

        loadoutRepository.save(loadout);
    }

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

        if (loadout.getItems().size() < 5) {
            loadout.getItems().add(weaponInstance);
        } else {
            loadout.getItems().add(weaponInstance);
        }

        return loadoutRepository.save(loadout);
    }
}
