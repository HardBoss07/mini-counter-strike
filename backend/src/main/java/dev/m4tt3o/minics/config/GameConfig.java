package dev.m4tt3o.minics.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Externalized game settings.
 */
@Configuration
@ConfigurationProperties(prefix = "minics.game")
@Getter
@Setter
public class GameConfig {

    private int startingHp = 100;
    private int baseEnergy = 2;
    private int maxEnergy = 10;
}
