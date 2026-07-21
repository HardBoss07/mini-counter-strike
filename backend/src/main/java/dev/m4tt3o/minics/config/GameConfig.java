package dev.m4tt3o.minics.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Externalized game settings.
 *
 * <p>Energy model:
 * <ul>
 *   <li>{@code baseEnergy} — energy granted on turn 1.</li>
 *   <li>{@code energyScalingFactor} — additional energy granted per subsequent player-turn.</li>
 *   <li>{@code maxEnergyPerTurn} — ceiling on the energy granted in a single replenishment (6).</li>
 *   <li>{@code maxEnergy} — ceiling on total energy a player may hold at any time (10).</li>
 * </ul>
 */
@Configuration
@ConfigurationProperties(prefix = "minics.game")
@Getter
@Setter
public class GameConfig {

    private int startingHp = 100;
    private int baseEnergy = 2;
    private int energyScalingFactor = 1;
    private int maxEnergyPerTurn = 6;
    private int maxEnergy = 10;
}
