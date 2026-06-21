package dev.m4tt3o.minics.controller;

import dev.m4tt3o.minics.dto.SaveLoadoutRequest;
import dev.m4tt3o.minics.entity.UserWeaponInstance;
import dev.m4tt3o.minics.service.LoadoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/loadout")
@RequiredArgsConstructor
public class LoadoutController {

    private final LoadoutService loadoutService;

    @GetMapping
    public ResponseEntity<Map<String, Set<UserWeaponInstance>>> getUserLoadout() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Set<UserWeaponInstance>> loadouts = loadoutService.getFullLoadout(username);
        return ResponseEntity.ok(loadouts);
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, String>> saveLoadout(@RequestBody SaveLoadoutRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        loadoutService.saveFullLoadout(username, request.tLoadoutIds(), request.ctLoadoutIds());
        return ResponseEntity.ok(Map.of("message", "Loadout saved successfully"));
    }
}
