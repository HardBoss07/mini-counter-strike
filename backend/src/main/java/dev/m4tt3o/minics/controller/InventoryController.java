package dev.m4tt3o.minics.controller;

import dev.m4tt3o.minics.dto.SaveLoadoutRequest;
import dev.m4tt3o.minics.dto.inventory.UserCaseInstanceDTO;
import dev.m4tt3o.minics.dto.inventory.WeaponInstanceDTO;
import dev.m4tt3o.minics.service.InventoryService;
import dev.m4tt3o.minics.service.LoadoutService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final LoadoutService loadoutService;

    @GetMapping("/weapons")
    public ResponseEntity<List<WeaponInstanceDTO>> getWeapons() {
        String username = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
        return ResponseEntity.ok(inventoryService.getWeaponsForUser(username));
    }

    // Loadout saving endpoint moved here from LoadoutController
    @PostMapping("/loadouts/save")
    public ResponseEntity<Map<String, String>> saveLoadout(
        @RequestBody SaveLoadoutRequest request
    ) {
        String username = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
        loadoutService.saveFullLoadout(
            username,
            request.tLoadoutIds(),
            request.ctLoadoutIds()
        );
        return ResponseEntity.ok(
            Map.of("message", "Loadout saved successfully")
        );
    }

    // Cases retrieval endpoint moved here from CaseController
    @GetMapping("/cases")
    public ResponseEntity<List<UserCaseInstanceDTO>> getUserCases() {
        String username = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
            
        return ResponseEntity.ok(inventoryService.getUserCases(username)); 
    }
}
