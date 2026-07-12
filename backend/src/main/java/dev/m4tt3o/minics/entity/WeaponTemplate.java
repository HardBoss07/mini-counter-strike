package dev.m4tt3o.minics.entity;

import dev.m4tt3o.minics.dto.ItemRarity;
import dev.m4tt3o.minics.dto.ItemType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Base catalog of weapons and utilities.
 */
@Entity
@Table(name = "weapon_template")
@Getter
@Setter
public class WeaponTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType type;

    @Column(nullable = false)
    private String side; // T, CT, ALL

    @Column(nullable = false)
    private int energyCost;

    @Column(nullable = false)
    private int damage;

    @Column(nullable = false)
    private int drawWeight;

    private Double critChance;

    private Double critMultiplier;

    private String statusEffect;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemRarity rarity = ItemRarity.BASE_GRADE;

    private String imageUrl;

    private String description;

    @ManyToOne
    @JoinColumn(name = "case_id")
    private CaseTemplate caseTemplate;
}
