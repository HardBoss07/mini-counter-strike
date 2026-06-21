package dev.m4tt3o.minics.controller;

import dev.m4tt3o.minics.dto.economy.OpenCaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/economy")
@RequiredArgsConstructor
public class EconomyController {

    @PostMapping("/cases/open")
    public ResponseEntity<OpenCaseResponse> openCase() {
        // Mocked unboxing logic
        return ResponseEntity.ok(new OpenCaseResponse("AK-47", "LEGENDARY", "/images/AK-47.png"));
    }
}
