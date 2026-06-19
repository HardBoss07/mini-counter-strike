package dev.m4tt3o.mini_cs.controller;

import dev.m4tt3o.mini_cs.dto.SaveLoadoutRequest;
import dev.m4tt3o.mini_cs.service.LoadoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/loadout")
@RequiredArgsConstructor
public class LoadoutController {

    private final LoadoutService loadoutService;

    @PostMapping("/save")
    public ResponseEntity<Map<String, String>> saveLoadout(@RequestBody SaveLoadoutRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        loadoutService.saveFullLoadout(username, request.tLoadoutIds(), request.ctLoadoutIds());
        return ResponseEntity.ok(Map.of("message", "Loadout saved successfully"));
    }
}
