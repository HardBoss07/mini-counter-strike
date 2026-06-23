package dev.m4tt3o.minics.controller;

import dev.m4tt3o.minics.dto.WeaponArchetype;
import dev.m4tt3o.minics.entity.WeaponTemplate;
import dev.m4tt3o.minics.repository.WeaponTemplateRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for retrieving weapon and item data.
 */
@RestController
@RequestMapping("/api/weapons")
@RequiredArgsConstructor
public class WeaponController {

    private final WeaponTemplateRepository weaponTemplateRepository;

    /**
     * Returns the full catalog of weapon templates.
     */
    @GetMapping
    public ResponseEntity<List<WeaponArchetype>> getAllWeapons() {
        List<WeaponArchetype> weapons = weaponTemplateRepository
            .findAll()
            .stream()
            .map(this::mapToArchetype)
            .toList();
        return ResponseEntity.ok(weapons);
    }

    private WeaponArchetype mapToArchetype(WeaponTemplate t) {
        return new WeaponArchetype(
            t.getId(),
            t.getName(),
            t.getType(),
            t.getSide(),
            t.getEnergyCost(),
            t.getDamage(),
            t.getDrawWeight(),
            t.getCritChance() != null ? t.getCritChance() : 0.0,
            t.getCritMultiplier() != null ? t.getCritMultiplier() : 1.0,
            t.getStatusEffect() != null ? t.getStatusEffect() : "NONE",
            t.getImageUrl(),
            t.getDescription()
        );
    }
}
