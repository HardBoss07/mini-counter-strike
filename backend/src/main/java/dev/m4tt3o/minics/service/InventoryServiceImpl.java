package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.dto.ItemRarity;
import dev.m4tt3o.minics.dto.economy.OpenCaseResponse;
import dev.m4tt3o.minics.dto.inventory.CaseTemplateDTO;
import dev.m4tt3o.minics.dto.inventory.UserCaseInstanceDTO;
import dev.m4tt3o.minics.dto.inventory.WeaponInstanceDTO;
import dev.m4tt3o.minics.dto.inventory.WeaponTemplateDTO;
import dev.m4tt3o.minics.entity.CaseTemplate;
import dev.m4tt3o.minics.entity.User;
import dev.m4tt3o.minics.entity.UserCaseInstance;
import dev.m4tt3o.minics.entity.UserWeaponInstance;
import dev.m4tt3o.minics.entity.WeaponTemplate;
import dev.m4tt3o.minics.repository.UserCaseInstanceRepository;
import dev.m4tt3o.minics.repository.UserRepository;
import dev.m4tt3o.minics.repository.UserWeaponInstanceRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final UserWeaponInstanceRepository weaponInstanceRepository;
    private final UserRepository userRepository;
    private final UserCaseInstanceRepository userCaseInstanceRepository;

    private static final Map<ItemRarity, Integer> RARITY_WEIGHTS = Map.of(
        ItemRarity.MIL_SPEC,
        70,
        ItemRarity.RESTRICTED,
        20,
        ItemRarity.CLASSIFIED,
        7,
        ItemRarity.COVERT,
        3
    );

    @Override
    @Transactional(readOnly = true)
    public List<WeaponInstanceDTO> getWeaponsForUser(String username) {
        User user = userRepository
            .findByUsername(username)
            .orElseThrow(() ->
                new RuntimeException("User not found: " + username)
            );

        return weaponInstanceRepository
            .findByUser(user)
            .stream()
            .map(WeaponInstanceDTO::fromEntity)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserCaseInstanceDTO> getUserCases(String username) {
        User user = userRepository
            .findByUsername(username)
            .orElseThrow(() ->
                new RuntimeException("User not found: " + username)
            );

        List<UserCaseInstance> instances =
            userCaseInstanceRepository.findByUserId(user.getId());
        return instances.stream().map(this::mapToUserCaseInstanceDTO).toList();
    }

    @Override
    @Transactional
    public OpenCaseResponse openCase(Long userId, Long userCaseInstanceId) {
        User user = userRepository
            .findById(userId)
            .orElseThrow(() ->
                new RuntimeException("User not found: " + userId)
            );

        UserCaseInstance caseInstance = userCaseInstanceRepository
            .findById(userCaseInstanceId)
            .orElseThrow(() ->
                new RuntimeException(
                    "Case instance not found: " + userCaseInstanceId
                )
            );

        if (!caseInstance.getUser().getId().equals(userId)) {
            throw new RuntimeException("You do not own this case instance");
        }

        CaseTemplate caseTemplate = caseInstance.getCaseTemplate();
        List<WeaponTemplate> weapons = caseTemplate.getWeapons();
        if (weapons == null || weapons.isEmpty()) {
            throw new RuntimeException(
                "Case template has no weapons configured"
            );
        }

        WeaponTemplate wonTemplate = selectRandomWeaponByRarity(weapons);

        processInventoryChange(user, wonTemplate, caseInstance);

        return new OpenCaseResponse(
            wonTemplate.getName(),
            wonTemplate.getRarity().name(),
            wonTemplate.getImageUrl()
        );
    }

    private UserCaseInstanceDTO mapToUserCaseInstanceDTO(
        UserCaseInstance instance
    ) {
        CaseTemplate caseTemplate = instance.getCaseTemplate();
        List<WeaponTemplateDTO> weapons = caseTemplate
            .getWeapons()
            .stream()
            .map(WeaponTemplateDTO::fromEntity)
            .toList();
        CaseTemplateDTO caseTemplateDTO = new CaseTemplateDTO(
            caseTemplate.getId(),
            caseTemplate.getTitle(),
            caseTemplate.getImageUrl(),
            weapons
        );
        return new UserCaseInstanceDTO(instance.getId(), caseTemplateDTO);
    }

    private WeaponTemplate selectRandomWeaponByRarity(
        List<WeaponTemplate> weapons
    ) {
        Map<ItemRarity, List<WeaponTemplate>> groupedByRarity = weapons
            .stream()
            .filter(weapon -> RARITY_WEIGHTS.containsKey(weapon.getRarity()))
            .collect(Collectors.groupingBy(WeaponTemplate::getRarity));

        if (groupedByRarity.isEmpty()) {
            throw new RuntimeException(
                "No unboxable weapon rarities found in this case"
            );
        }

        int totalWeight = groupedByRarity
            .keySet()
            .stream()
            .mapToInt(RARITY_WEIGHTS::get)
            .sum();

        double randomValue = Math.random() * totalWeight;
        double cumulativeWeight = 0.0;
        ItemRarity selectedRarity = null;

        for (Map.Entry<
            ItemRarity,
            List<WeaponTemplate>
        > entry : groupedByRarity.entrySet()) {
            ItemRarity rarity = entry.getKey();
            cumulativeWeight += RARITY_WEIGHTS.get(rarity);
            if (randomValue < cumulativeWeight) {
                selectedRarity = rarity;
                break;
            }
        }

        if (selectedRarity == null) {
            selectedRarity = groupedByRarity.keySet().iterator().next();
        }

        List<WeaponTemplate> weaponsOfRarity = groupedByRarity.get(
            selectedRarity
        );
        return chooseWeaponFromRarity(weaponsOfRarity);
    }

    private WeaponTemplate chooseWeaponFromRarity(
        List<WeaponTemplate> weaponsOfRarity
    ) {
        int randomIndex = (int) (Math.random() * weaponsOfRarity.size());
        return weaponsOfRarity.get(randomIndex);
    }

    private void processInventoryChange(
        User user,
        WeaponTemplate wonTemplate,
        UserCaseInstance caseInstance
    ) {
        UserWeaponInstance weaponInstance = new UserWeaponInstance();
        weaponInstance.setUser(user);
        weaponInstance.setTemplate(wonTemplate);
        weaponInstance.setSkinName(parseSkinName(wonTemplate.getName()));

        weaponInstanceRepository.save(weaponInstance);
        userCaseInstanceRepository.delete(caseInstance);
    }

    private String parseSkinName(String fullWeaponName) {
        if (fullWeaponName != null && fullWeaponName.contains(" | ")) {
            String[] parts = fullWeaponName.split(" \\| ");
            return parts[1];
        }
        return "Default";
    }
}
