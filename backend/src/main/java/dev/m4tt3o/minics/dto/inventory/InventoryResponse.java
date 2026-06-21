package dev.m4tt3o.minics.dto.inventory;

import dev.m4tt3o.minics.entity.UserWeaponInstance;
import java.util.List;

public record InventoryResponse(List<UserWeaponInstance> weapons, List<Long> tLoadoutIds, List<Long> ctLoadoutIds) {}
