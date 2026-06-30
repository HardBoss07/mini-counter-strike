package dev.m4tt3o.minics.config;

import java.security.SecureRandom;
import java.util.Random;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EngineConfig {

    @Bean
    public Random random() {
        return new SecureRandom();
    }
}
