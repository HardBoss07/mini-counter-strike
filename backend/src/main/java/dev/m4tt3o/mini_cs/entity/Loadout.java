package dev.m4tt3o.mini_cs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

/**
 * User loadout for a specific side (T or CT) with exactly 5 items.
 */
@Entity
@Table(name = "loadout")
@Getter
@Setter
public class Loadout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String side;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "loadout_item",
        joinColumns = @JoinColumn(name = "loadout_id"),
        inverseJoinColumns = @JoinColumn(name = "user_weapon_instance_id")
    )
    private List<UserWeaponInstance> items = new ArrayList<>();

    public List<UserWeaponInstance> getItems() {
        return items;
    }
}
