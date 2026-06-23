package dev.m4tt3o.minics.dto.inventory;

import dev.m4tt3o.minics.entity.UserWeaponInstance;
import dev.m4tt3o.minics.entity.WeaponTemplate;

/**
 * Flattened view of a user's weapon instance combined with its template details.
 * Eliminates JPA entity serialization and prevents leaking internal entities (e.g. User).
 */
public record WeaponInstanceDTO(
    Long id,
    String name,
    String type,
    String side,
    int energyCost,
    int damage,
    int drawWeight,
    Double critChance,
    Double critMultiplier,
    String statusEffect,
    String imageUrl,
    String description,
    String skinName
) {
    /**
     * Maps a {@link UserWeaponInstance} entity (with its joined {@link WeaponTemplate})
     * into a flat DTO suitable for API responses.
     * Modifier values from the instance are applied to the template base stats.
     */
    public static WeaponInstanceDTO fromEntity(UserWeaponInstance instance) {
        var template = instance.getTemplate();
        return new WeaponInstanceDTO(
            instance.getId(),
            template.getName(),
            template.getType().name(),
            template.getSide(),
            template.getEnergyCost() + instance.getCostModifier(),
            template.getDamage() + instance.getDamageModifier(),
            template.getDrawWeight() + instance.getDrawWeightModifier(),
            template.getCritChance(),
            template.getCritMultiplier(),
            template.getStatusEffect(),
            template.getImageUrl(),
            template.getDescription(),
            instance.getSkinName()
        );
    }
}
