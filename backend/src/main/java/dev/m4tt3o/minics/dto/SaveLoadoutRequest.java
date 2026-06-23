package dev.m4tt3o.minics.dto;

import java.util.List;

public record SaveLoadoutRequest(
    List<Long> tLoadoutIds,
    List<Long> ctLoadoutIds
) {}
