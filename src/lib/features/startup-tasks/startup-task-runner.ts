import { IUnleashServices } from '../../server-impl';
import { ProcessFeatureCreatedByIdTask } from './tasks/process-feature-created-by-id-task';

export const scheduleStartupTasks = async (
    services: IUnleashServices,
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
        versionService,
        lastSeenService,
        proxyService,
        clientMetricsServiceV2,
        startupTaskService,
    } = services;

    startupTaskService.scheduleStart(
        new ProcessFeatureCreatedByIdTask(services),
        1000,
        'processFeatureCreatedByIdTask',
    );
};
