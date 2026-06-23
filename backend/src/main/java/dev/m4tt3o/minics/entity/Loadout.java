package dev.m4tt3o.minics.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

/**
 * User loadout for a specific side (T or CT) with exactly 5 items.
 * Rules (3 guns, 2 utilities) are enforced via business logic.
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
    // Replaced List + @OrderColumn with a Set to match the composite PK schema
    private Set<UserWeaponInstance> items = new HashSet<>();

    public Set<UserWeaponInstance> getItems() {
        return items;
    }
}
