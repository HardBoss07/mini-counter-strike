package dev.m4tt3o.mini_cs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Specific instance of a weapon owned by a user.
 */
@Entity
@Table(name = "user_weapon_instance")
@Getter
@Setter
public class UserWeaponInstance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "template_id")
    private WeaponTemplate template;

    private String skinName = "Default";

    private int damageModifier = 0;
    private int costModifier = 0;
    private int drawWeightModifier = 0;
}
