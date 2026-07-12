package dev.m4tt3o.minics.dto.inventory;

import dev.m4tt3o.minics.entity.WeaponTemplate;

public record WeaponTemplateDTO(
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
    String rarity,
    String imageUrl,
    String description
) {
    public static WeaponTemplateDTO fromEntity(WeaponTemplate template) {
        return new WeaponTemplateDTO(
            template.getId(),
            template.getName(),
            template.getType().name(),
            template.getSide(),
            template.getEnergyCost(),
            template.getDamage(),
            template.getDrawWeight(),
            template.getCritChance(),
            template.getCritMultiplier(),
            template.getStatusEffect(),
            template.getRarity().name(),
            template.getImageUrl(),
            template.getDescription()
        );
    }
}
