package dev.m4tt3o.mini_cs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableConfigurationProperties
@EnableScheduling
public class MiniCsApplication {

    public static void main(String[] args) {
        SpringApplication.run(MiniCsApplication.class, args);
    }

}
