package dev.m4tt3o.minics.support;

import dev.m4tt3o.minics.dto.ItemRarity;
import dev.m4tt3o.minics.dto.ItemType;
import dev.m4tt3o.minics.dto.PlayerState;
import dev.m4tt3o.minics.dto.StatusEffect;
import dev.m4tt3o.minics.dto.WeaponArchetype;
import dev.m4tt3o.minics.dto.match.LiveMatchState;
import dev.m4tt3o.minics.entity.User;
import dev.m4tt3o.minics.entity.UserWeaponInstance;
import dev.m4tt3o.minics.entity.WeaponTemplate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

public final class TestFixtures {

    private TestFixtures() {}

    public static WeaponArchetype weapon(
        Long id,
        String name,
        ItemType type,
        int energyCost,
        int damage,
        int drawWeight,
        double critChance,
        double critMultiplier,
        String statusEffect
    ) {
        return new WeaponArchetype(
            id,
            name,
            type,
            "ALL",
            energyCost,
            damage,
            drawWeight,
            critChance,
            critMultiplier,
            statusEffect,
            ItemRarity.BASE_GRADE,
            "/images/test.png",
            "Test weapon"
        );
    }

    public static WeaponArchetype rifle(long id) {
        return weapon(
            id,
            "AK-47",
            ItemType.WEAPON,
            3,
            30,
            50,
            0.0,
            1.0,
            "NONE"
        );
    }

    public static WeaponArchetype molotov(long id) {
        return weapon(
            id,
            "Molotov",
            ItemType.UTILITY,
            3,
            10,
            30,
            0.0,
            1.0,
            "BURN_15"
        );
    }

    public static WeaponArchetype flashbang(long id) {
        return weapon(
            id,
            "Flashbang",
            ItemType.UTILITY,
            2,
            0,
            20,
            0.0,
            1.0,
            "BLIND_50"
        );
    }

    public static WeaponArchetype smokeGrenade(long id) {
        return weapon(
            id,
            "Smoke Grenade",
            ItemType.UTILITY,
            2,
            0,
            20,
            0.0,
            1.0,
            "SKIP_TURN"
        );
    }

    public static PlayerState playerState(
        long id,
        String username,
        int hp,
        int energy,
        List<WeaponArchetype> hand,
        Set<StatusEffect> effects
    ) {
        return new PlayerState(id, username, hp, energy, hand, effects);
    }

    public static PlayerState playerState(
        long id,
        String username,
        int hp,
        WeaponArchetype... hand
    ) {
        return playerState(
            id,
            username,
            hp,
            10,
            List.of(hand),
            Collections.emptySet()
        );
    }

    public static LiveMatchState liveMatchState(
        int round,
        long activePlayerId,
        boolean playerAIsT,
        PlayerState playerA,
        PlayerState playerB
    ) {
        return new LiveMatchState(
            round,
            activePlayerId,
            playerAIsT,
            playerA,
            playerB,
            new ArrayList<>(List.of("Match started."))
        );
    }

    public static User user(long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        return user;
    }

    public static UserWeaponInstance loadoutWeaponInstance(
        long id,
        String name,
        ItemType type,
        String side
    ) {
        WeaponTemplate template = new WeaponTemplate();
        template.setId(id);
        template.setName(name);
        template.setType(type);
        template.setSide(side);
        template.setEnergyCost(3);
        template.setDamage(30);
        template.setDrawWeight(50);
        template.setCritChance(0.0);
        template.setCritMultiplier(1.0);
        template.setStatusEffect("NONE");
        template.setRarity(ItemRarity.BASE_GRADE);

        UserWeaponInstance instance = new UserWeaponInstance();
        instance.setId(id);
        instance.setTemplate(template);
        return instance;
    }

    public static List<WeaponArchetype> standardLoadout() {
        return List.of(
            rifle(1L),
            rifle(2L),
            rifle(3L),
            molotov(4L),
            smokeGrenade(5L)
        );
    }
}
