package dev.m4tt3o.mini_cs.dto.inventory;

import dev.m4tt3o.mini_cs.entity.UserWeaponInstance;
import java.util.List;

public record InventoryResponse(List<UserWeaponInstance> weapons, List<Long> tLoadoutIds, List<Long> ctLoadoutIds) {}
