package dev.m4tt3o.minics.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.m4tt3o.minics.entity.CaseTemplate;
import dev.m4tt3o.minics.entity.User;
import dev.m4tt3o.minics.entity.UserCaseInstance;
import dev.m4tt3o.minics.repository.CaseTemplateRepository;
import dev.m4tt3o.minics.repository.UserCaseInstanceRepository;
import dev.m4tt3o.minics.repository.UserRepository;
import java.time.Clock;
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
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CaseDropSchedulerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserCaseInstanceRepository caseInstanceRepository;

    @Mock
    private CaseTemplateRepository caseTemplateRepository;

    private Clock clock;

    private CaseDropScheduler scheduler;

    @BeforeEach
    void setUp() {
        clock = Clock.fixed(
            Instant.parse("2026-08-02T16:05:00Z"),
            ZoneOffset.UTC
        );
        scheduler = new CaseDropScheduler(
            userRepository,
            caseInstanceRepository,
            caseTemplateRepository,
            clock
        );
    }

    @Test
    void processPendingCaseDrops_grantsCaseAndClearsCooldown() {
        // Given
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setNextCaseAvailableAt(LocalDateTime.of(2026, 8, 2, 16, 0, 0));

        List<User> eligibleUsers = new ArrayList<>();
        eligibleUsers.add(user);

        CaseTemplate defaultCase = new CaseTemplate();
        defaultCase.setId(10L);
        defaultCase.setTitle("Default Case");

        LocalDateTime now = LocalDateTime.now(clock);

        when(
            userRepository.findByNextCaseAvailableAtLessThanEqual(now)
        ).thenReturn(eligibleUsers);
        when(caseTemplateRepository.findFirstByOrderByIdAsc()).thenReturn(
            Optional.of(defaultCase)
        );

        // When
        scheduler.processPendingCaseDrops();

        // Then
        ArgumentCaptor<UserCaseInstance> caseCaptor = ArgumentCaptor.forClass(
            UserCaseInstance.class
        );
        verify(caseInstanceRepository, times(1)).save(caseCaptor.capture());

        UserCaseInstance savedCase = caseCaptor.getValue();
        assertThat(savedCase.getUser()).isEqualTo(user);
        assertThat(savedCase.getCaseTemplate()).isEqualTo(defaultCase);
        assertThat(savedCase.isOpened()).isFalse();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getNextCaseAvailableAt()).isNull();
    }
}
