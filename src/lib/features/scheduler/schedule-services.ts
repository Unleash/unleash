import {
    hoursToMilliseconds,
    minutesToMilliseconds,
    secondsToMilliseconds,
} from 'date-fns';
import type { IUnleashConfig } from '../../types/index.js';
import type { IUnleashServices } from '../../services/index.js';

/**
 * Schedules service methods.
 *
 * In order to promote runtime control, you should **not use** a flagResolver inside this method. Instead, implement your flag usage inside the scheduled methods themselves.
 * @param services
 * @param config
 */
export const scheduleServices = (
    services: IUnleashServices,
    config: IUnleashConfig,
): void => {
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
        uniqueConnectionService,
        unknownFlagsService,
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

    // TODO this works fine for keeping labeledAppCounts up to date, but
    // it would be nice if we can keep client_apps_total prometheus metric
    // up to date. We'd need to have access to DbMetricsMonitor, which is
    // where the metric is registered and call an update only for that metric
    schedulerService.schedule(
        instanceStatsService.getLabeledAppCounts.bind(instanceStatsService),
        minutesToMilliseconds(5),
        'refreshAppCountSnapshot',
    );

    schedulerService.schedule(
        clientInstanceService.removeOldInstances.bind(clientInstanceService),
        hoursToMilliseconds(24),
        'removeInstancesOlderThanTwoDays',
    );

    schedulerService.schedule(
        clientInstanceService.removeInactiveApplications.bind(
            clientInstanceService,
        ),
        hoursToMilliseconds(24),
        'removeInactiveApplications',
    );

    schedulerService.schedule(
        clientInstanceService.bulkAdd.bind(clientInstanceService),
        secondsToMilliseconds(10),
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
        () => {
            console.debug(
                `==== Checking latest version (scheduled task) ${versionService.constructor.name} ${JSON.stringify(versionService)} ====`,
            );
            return versionService.checkLatestVersion(() =>
                instanceStatsService.getFeatureUsageInfo(),
            );
        },
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

    schedulerService.schedule(
        uniqueConnectionService.sync.bind(uniqueConnectionService),
        minutesToMilliseconds(10),
        'uniqueConnectionService',
    );

    schedulerService.schedule(
        unknownFlagsService.flush.bind(unknownFlagsService),
        minutesToMilliseconds(2),
        'flushUnknownFlags',
    );

    schedulerService.schedule(
        unknownFlagsService.clear.bind(unknownFlagsService, 24),
        hoursToMilliseconds(6),
        'clearUnknownFlags',
    );
};
