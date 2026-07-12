package dev.m4tt3o.minics.dto.inventory;

import java.util.List;

public record CaseTemplateDTO(
    Long id,
    String title,
    List<WeaponTemplateDTO> weapons
) {}
