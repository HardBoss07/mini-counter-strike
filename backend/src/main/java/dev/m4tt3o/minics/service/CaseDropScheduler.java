package dev.m4tt3o.minics.service;

import dev.m4tt3o.minics.entity.CaseTemplate;
import dev.m4tt3o.minics.entity.User;
import dev.m4tt3o.minics.entity.UserCaseInstance;
import dev.m4tt3o.minics.repository.CaseTemplateRepository;
import dev.m4tt3o.minics.repository.UserCaseInstanceRepository;
import dev.m4tt3o.minics.repository.UserRepository;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class CaseDropScheduler {

    private final UserRepository userRepository;
    private final UserCaseInstanceRepository caseInstanceRepository;
    private final CaseTemplateRepository caseTemplateRepository;
    private final Clock clock;

    @Scheduled(fixedDelayString = "${game.cases.check-interval:60000}")
    @Transactional
    public void processPendingCaseDrops() {
        LocalDateTime now = LocalDateTime.now(clock);
        List<User> eligibleUsers =
            userRepository.findByNextCaseAvailableAtLessThanEqual(now);

        if (eligibleUsers.isEmpty()) {
            return;
        }

        CaseTemplate defaultCase = caseTemplateRepository
            .findFirstByOrderByIdAsc()
            .orElseThrow(() ->
                new IllegalStateException(
                    "No case template available for drop."
                )
            );

        for (User user : eligibleUsers) {
            UserCaseInstance newCase = new UserCaseInstance();
            newCase.setUser(user);
            newCase.setCaseTemplate(defaultCase);
            newCase.setOpened(false);
            caseInstanceRepository.save(newCase);

            user.setNextCaseAvailableAt(null);
            userRepository.save(user);
        }
    }
}
