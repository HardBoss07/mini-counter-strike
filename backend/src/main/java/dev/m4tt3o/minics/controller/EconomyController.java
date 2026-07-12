package dev.m4tt3o.minics.controller;

import dev.m4tt3o.minics.dto.economy.OpenCaseResponse;
import dev.m4tt3o.minics.dto.inventory.UserCaseInstanceDTO;
import dev.m4tt3o.minics.entity.User;
import dev.m4tt3o.minics.repository.UserRepository;
import dev.m4tt3o.minics.service.InventoryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/economy")
@RequiredArgsConstructor
public class EconomyController {

    private final InventoryService inventoryService;
    private final UserRepository userRepository;

    @GetMapping("/cases")
    public ResponseEntity<List<UserCaseInstanceDTO>> getUserCases() {
        String username = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
        return ResponseEntity.ok(inventoryService.getUserCases(username));
    }

    @PostMapping("/cases/{id}/open")
    public ResponseEntity<OpenCaseResponse> openCase(
        @PathVariable("id") Long userCaseInstanceId
    ) {
        String username = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
        User user = userRepository
            .findByUsername(username)
            .orElseThrow(() ->
                new RuntimeException("User not found: " + username)
            );
        return ResponseEntity.ok(
            inventoryService.openCase(user.getId(), userCaseInstanceId)
        );
    }
}
