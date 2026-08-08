package dev.m4tt3o.minics.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.m4tt3o.minics.config.GameConfig;
import dev.m4tt3o.minics.dto.ItemRarity;
import dev.m4tt3o.minics.dto.economy.OpenCaseResponse;
import dev.m4tt3o.minics.entity.CaseTemplate;
import dev.m4tt3o.minics.entity.User;
import dev.m4tt3o.minics.entity.UserCaseInstance;
import dev.m4tt3o.minics.entity.UserWeaponInstance;
import dev.m4tt3o.minics.entity.WeaponTemplate;
import dev.m4tt3o.minics.repository.UserCaseInstanceRepository;
import dev.m4tt3o.minics.repository.UserRepository;
import dev.m4tt3o.minics.repository.UserWeaponInstanceRepository;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InventoryServiceImplTest {

    @Mock
    private UserWeaponInstanceRepository weaponInstanceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserCaseInstanceRepository userCaseInstanceRepository;

    @Spy
    private GameConfig gameConfig = new GameConfig();

    private Clock clock;

    private InventoryServiceImpl inventoryService;

    @BeforeEach
    void setUp() {
        clock = Clock.fixed(Instant.parse("2026-08-02T12:00:00Z"), ZoneOffset.UTC);
        inventoryService = new InventoryServiceImpl(
            weaponInstanceRepository,
            userRepository,
            userCaseInstanceRepository,
            clock,
            gameConfig
        );
    }

    @Test
    void openCase_whenLastCaseOpened_sets4HourCooldown() {
        // Given
        Long userId = 1L;
        Long userCaseInstanceId = 2L;

        User user = new User();
        user.setId(userId);
        user.setUsername("testuser");

        CaseTemplate caseTemplate = new CaseTemplate();
        caseTemplate.setId(10L);
        caseTemplate.setTitle("Test Case");

        WeaponTemplate weaponTemplate = new WeaponTemplate();
        weaponTemplate.setId(20L);
        weaponTemplate.setName("AK-47 | Redline");
        weaponTemplate.setRarity(ItemRarity.CLASSIFIED);

        List<WeaponTemplate> weapons = new ArrayList<>();
        weapons.add(weaponTemplate);
        caseTemplate.setWeapons(weapons);

        UserCaseInstance caseInstance = new UserCaseInstance();
        caseInstance.setId(userCaseInstanceId);
        caseInstance.setUser(user);
        caseInstance.setCaseTemplate(caseTemplate);
        caseInstance.setOpened(false);

        doReturn(Duration.ofHours(4)).when(gameConfig).getDropCooldown();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userCaseInstanceRepository.findById(userCaseInstanceId)).thenReturn(Optional.of(caseInstance));
        when(userCaseInstanceRepository.countByUserAndOpenedFalse(user)).thenReturn(0L);

        // When
        OpenCaseResponse response = inventoryService.openCase(userId, userCaseInstanceId);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.weaponName()).isEqualTo("AK-47 | Redline");

        verify(weaponInstanceRepository, times(1)).save(any(UserWeaponInstance.class));
        verify(userCaseInstanceRepository, times(1)).save(caseInstance);
        assertThat(caseInstance.isOpened()).isTrue();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getNextCaseAvailableAt()).isEqualTo(LocalDateTime.of(2026, 8, 2, 16, 0, 0));
    }
}
