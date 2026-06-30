package dev.m4tt3o.minics.service.mapper;

import dev.m4tt3o.minics.dto.WeaponArchetype;
import dev.m4tt3o.minics.entity.UserWeaponInstance;
import dev.m4tt3o.minics.entity.WeaponTemplate;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Maps domain entities to DTOs, specifically converting weapon instances to archetypes.
 * Encapsulates transformation logic separate from service orchestration.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class LoadoutArchetypeMapper {

    /**
     * Converts a UserWeaponInstance (with modifiers) to a WeaponArchetype (runtime DTO).
     */
    public static WeaponArchetype mapInstanceToArchetype(
        UserWeaponInstance instance
    ) {
        WeaponTemplate template = instance.getTemplate();
        int energyCost = Math.max(
            0,
            template.getEnergyCost() + instance.getCostModifier()
        );
        int damage = Math.max(
            0,
            template.getDamage() + instance.getDamageModifier()
        );
        int drawWeight = Math.max(
            1,
            template.getDrawWeight() + instance.getDrawWeightModifier()
        );

        return new WeaponArchetype(
            template.getId(),
            template.getName(),
            template.getType(),
            template.getSide(),
            energyCost,
            damage,
            drawWeight,
            template.getCritChance() != null ? template.getCritChance() : 0.0,
            template.getCritMultiplier() != null
                ? template.getCritMultiplier()
                : 1.0,
            template.getStatusEffect() != null
                ? template.getStatusEffect()
                : "NONE",
            template.getRarity(),
            template.getImageUrl(),
            template.getDescription()
        );
    }

    /**
     * Converts a WeaponTemplate to a WeaponArchetype (baseline DTO).
     */
    public static WeaponArchetype mapTemplateToArchetype(
        WeaponTemplate template
    ) {
        return new WeaponArchetype(
            template.getId(),
            template.getName(),
            template.getType(),
            template.getSide(),
            template.getEnergyCost(),
            template.getDamage(),
            template.getDrawWeight(),
            template.getCritChance() != null ? template.getCritChance() : 0.0,
            template.getCritMultiplier() != null
                ? template.getCritMultiplier()
                : 1.0,
            template.getStatusEffect() != null
                ? template.getStatusEffect()
                : "NONE",
            template.getRarity(),
            template.getImageUrl(),
            template.getDescription()
        );
    }
}
