import {
    hoursToMilliseconds,
    minutesToMilliseconds,
    secondsToMilliseconds,
} from 'date-fns';
import type { IUnleashConfig, IUnleashServices } from '../../server-impl';

/**
 * Schedules service methods.
 *
 * In order to promote runtime control, you should **not use** a flagResolver inside this method. Instead, implement your flag usage inside the scheduled methods themselves.
 * @param services
 */
export const scheduleServices = async (
    services: IUnleashServices,
    config: IUnleashConfig,
): Promise<void> => {
    const {
        accountService,
        schedulerService,
        apiTokenService,
        instanceStatsService,
        clientInstanceService,
        projectService,
        projectHealthService,
        configurationRevisionService,
        eventAnnouncerService,
        featureToggleService,
        eventService,
        versionService,
        lastSeenService,
        frontendApiService,
        clientMetricsServiceV2,
        integrationEventsService,
    } = services;

    schedulerService.schedule(
        lastSeenService.cleanLastSeen.bind(lastSeenService),
        hoursToMilliseconds(1),
        'cleanLastSeen',
    );

    schedulerService.schedule(
        lastSeenService.store.bind(lastSeenService),
        secondsToMilliseconds(30),
        'storeLastSeen',
    );

    schedulerService.schedule(
        apiTokenService.fetchActiveTokens.bind(apiTokenService),
        minutesToMilliseconds(1),
        'fetchActiveTokens',
        0, // no jitter, we need tokens at startup
    );

    schedulerService.schedule(
        apiTokenService.updateLastSeen.bind(apiTokenService),
        minutesToMilliseconds(3),
        'updateLastSeen',
    );

    schedulerService.schedule(
        instanceStatsService.refreshAppCountSnapshot.bind(instanceStatsService),
        minutesToMilliseconds(5),
        'refreshAppCountSnapshot',
    );

    schedulerService.schedule(
        clientInstanceService.removeInstancesOlderThanTwoDays.bind(
            clientInstanceService,
        ),
        hoursToMilliseconds(24),
        'removeInstancesOlderThanTwoDays',
    );

    schedulerService.schedule(
        clientInstanceService.bulkAdd.bind(clientInstanceService),
        secondsToMilliseconds(5),
        'bulkAddInstances',
    );

    schedulerService.schedule(
        clientInstanceService.announceUnannounced.bind(clientInstanceService),
        minutesToMilliseconds(5),
        'announceUnannounced',
    );

    schedulerService.schedule(
        projectService.statusJob.bind(projectService),
        hoursToMilliseconds(24),
        'statusJob',
    );

    schedulerService.schedule(
        projectHealthService.setHealthRating.bind(projectHealthService),
        hoursToMilliseconds(1),
        'setHealthRating',
    );

    schedulerService.schedule(
        configurationRevisionService.updateMaxRevisionId.bind(
            configurationRevisionService,
        ),
        secondsToMilliseconds(1),
        'updateMaxRevisionId',
    );

    schedulerService.schedule(
        eventAnnouncerService.publishUnannouncedEvents.bind(
            eventAnnouncerService,
        ),
        secondsToMilliseconds(1),
        'publishUnannouncedEvents',
    );

    schedulerService.schedule(
        featureToggleService.updatePotentiallyStaleFeatures.bind(
            featureToggleService,
        ),
        minutesToMilliseconds(1),
        'updatePotentiallyStaleFeatures',
    );

    schedulerService.schedule(
        versionService.checkLatestVersion.bind(versionService),
        hoursToMilliseconds(48),
        'checkLatestVersion',
    );

    schedulerService.schedule(
        frontendApiService.fetchFrontendSettings.bind(frontendApiService),
        minutesToMilliseconds(2),
        'fetchFrontendSettings',
        0,
    );

    schedulerService.schedule(
        () => clientMetricsServiceV2.bulkAdd().catch(console.error),
        secondsToMilliseconds(5),
        'bulkAddMetrics',
    );

    schedulerService.schedule(
        () => clientMetricsServiceV2.clearMetrics(48).catch(console.error),
        hoursToMilliseconds(12),
        'clearMetrics',
    );

    schedulerService.schedule(
        accountService.updateLastSeen.bind(accountService),
        minutesToMilliseconds(3),
        'updateAccountLastSeen',
    );

    if (config.server.enableScheduledCreatedByMigration) {
        schedulerService.schedule(
            eventService.setEventCreatedByUserId.bind(eventService),
            minutesToMilliseconds(15),
            'setEventCreatedByUserId',
        );
        schedulerService.schedule(
            featureToggleService.setFeatureCreatedByUserIdFromEvents.bind(
                featureToggleService,
            ),
            minutesToMilliseconds(15),
            'setFeatureCreatedByUserIdFromEvents',
        );
    }

    schedulerService.schedule(
        integrationEventsService.cleanUpEvents.bind(integrationEventsService),
        minutesToMilliseconds(15),
        'cleanUpIntegrationEvents',
    );
};
