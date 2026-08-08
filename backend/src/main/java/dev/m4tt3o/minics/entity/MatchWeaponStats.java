package dev.m4tt3o.minics.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "match_weapon_stats")
public class MatchWeaponStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private WeaponTemplate template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_weapon_instance_id")
    private UserWeaponInstance weaponInstance;

    private Integer timesUsed = 0;
    private Integer damageDealt = 0;
    private Integer kills = 0;
    private Integer critsLanded = 0;

    public MatchWeaponStats() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Match getMatch() {
        return match;
    }

    public void setMatch(Match match) {
        this.match = match;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public WeaponTemplate getTemplate() {
        return template;
    }

    public void setTemplate(WeaponTemplate template) {
        this.template = template;
    }

    public UserWeaponInstance getWeaponInstance() {
        return weaponInstance;
    }

    public void setWeaponInstance(UserWeaponInstance weaponInstance) {
        this.weaponInstance = weaponInstance;
    }

    public Integer getTimesUsed() {
        return timesUsed;
    }

    public void setTimesUsed(Integer timesUsed) {
        this.timesUsed = timesUsed;
    }

    public Integer getDamageDealt() {
        return damageDealt;
    }

    public void setDamageDealt(Integer damageDealt) {
        this.damageDealt = damageDealt;
    }

    public Integer getKills() {
        return kills;
    }

    public void setKills(Integer kills) {
        this.kills = kills;
    }

    public Integer getCritsLanded() {
        return critsLanded;
    }

    public void setCritsLanded(Integer critsLanded) {
        this.critsLanded = critsLanded;
    }
}
