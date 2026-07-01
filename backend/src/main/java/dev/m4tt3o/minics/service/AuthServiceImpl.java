package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.config.JwtUtil;
import dev.m4tt3o.minics.entity.*;
import dev.m4tt3o.minics.repository.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final WeaponTemplateRepository templateRepository;
    private final UserWeaponInstanceRepository instanceRepository;
    private final LoadoutRepository loadoutRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public String register(String username, String password) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        // 1. Create User
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user = userRepository.save(user);

        // 2. Provision Starter Weapons
        if (loadoutRepository.findByUser_Id(user.getId()).isEmpty()) {
            provisionStarterLoadout(
                user,
                "T",
                List.of(
                    "Glock-18",
                    "MAC-10",
                    "Galil AR",
                    "Molotov",
                    "Smoke Grenade"
                )
            );
            provisionStarterLoadout(
                user,
                "CT",
                List.of("USP-S", "MP9", "FAMAS", "HE Grenade", "Flashbang")
            );
        }

        return jwtUtil.generateToken(user.getId(), user.getUsername());
    }

    @Override
    public String login(String username, String password) {
        User user = userRepository
            .findByUsername(username)
            .orElseThrow(() ->
                new RuntimeException("Invalid username or password")
            );

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        return jwtUtil.generateToken(user.getId(), user.getUsername());
    }

    private void provisionStarterLoadout(
        User user,
        String side,
        List<String> itemNames
    ) {
        Loadout loadout = new Loadout();
        loadout.setUser(user);
        loadout.setSide(side);
        loadout = loadoutRepository.save(loadout);

        for (String name : itemNames) {
            WeaponTemplate template = templateRepository
                .findByName(name)
                .orElseThrow(() -> {
                    String errorMessage = "Starter item not found: " + name;
                    // Assuming a logger is not easily available, using System.err for now
                    System.err.println(errorMessage);
                    return new RuntimeException(errorMessage);
                });

            UserWeaponInstance instance = new UserWeaponInstance();
            instance.setUser(user);
            instance.setTemplate(template);
            instance = instanceRepository.save(instance);

            loadout.getItems().add(instance);
        }
        loadoutRepository.save(loadout);
    }
}
