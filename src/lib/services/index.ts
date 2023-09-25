import { IUnleashConfig, IUnleashStores, IUnleashServices } from '../types';
import FeatureTypeService from './feature-type-service';
import EventService from './event-service';
import HealthService from './health-service';

import ProjectService from './project-service';
import StateService from './state-service';
import ClientInstanceService from './client-metrics/instance-service';
import ClientMetricsServiceV2 from './client-metrics/metrics-service-v2';
import TagTypeService from './tag-type-service';
import TagService from './tag-service';
import StrategyService from './strategy-service';
import AddonService from './addon-service';
import ContextService from './context-service';
import VersionService from './version-service';
import { EmailService } from './email-service';
import { AccessService } from './access-service';
import { ApiTokenService } from './api-token-service';
import UserService from './user-service';
import ResetTokenService from './reset-token-service';
import SettingService from './setting-service';
import SessionService from './session-service';
import UserFeedbackService from './user-feedback-service';
import FeatureToggleService from './feature-toggle-service';
import EnvironmentService from './environment-service';
import FeatureTagService from './feature-tag-service';
import ProjectHealthService from './project-health-service';
import UserSplashService from './user-splash-service';
import { SegmentService } from './segment-service';
import { OpenApiService } from './openapi-service';
import { ClientSpecService } from './client-spec-service';
import { PlaygroundService } from '../features/playground/playground-service';
import { GroupService } from './group-service';
import { ProxyService } from './proxy-service';
import EdgeService from './edge-service';
import PatService from './pat-service';
import { PublicSignupTokenService } from './public-signup-token-service';
import { LastSeenService } from './client-metrics/last-seen-service';
import { InstanceStatsService } from '../features/instance-stats/instance-stats-service';
import { FavoritesService } from './favorites-service';
import MaintenanceService from './maintenance-service';
import {
    hoursToMilliseconds,
    minutesToMilliseconds,
    secondsToMilliseconds,
} from 'date-fns';
import { AccountService } from './account-service';
import { SchedulerService } from './scheduler-service';
import { Knex } from 'knex';
import {
    createExportImportTogglesService,
    createFakeExportImportTogglesService,
} from '../features/export-import-toggles/createExportImportService';
import { Db } from '../db/db';
import {
    createChangeRequestAccessReadModel,
    createFakeChangeRequestAccessService,
} from '../features/change-request-access-service/createChangeRequestAccessReadModel';
import ConfigurationRevisionService from '../features/feature-toggle/configuration-revision-service';
import { createFeatureToggleService } from '../features';
import EventAnnouncerService from './event-announcer-service';
import { createGroupService } from '../features/group/createGroupService';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from '../features/private-project/createPrivateProjectChecker';
import {
    createFakeGetActiveUsers,
    createGetActiveUsers,
} from '../features/instance-stats/getActiveUsers';
import { DependentFeaturesService } from '../features/dependent-features/dependent-features-service';
import { createDependentFeaturesService } from '../features/dependent-features/createDependentFeaturesService';

// TODO: will be moved to scheduler feature directory
export const scheduleServices = async (
    services: IUnleashServices,
): Promise<void> => {
    const {
        schedulerService,
        apiTokenService,
        instanceStatsService,
        clientInstanceService,
        projectService,
        projectHealthService,
        configurationRevisionService,
        maintenanceService,
        eventAnnouncerService,
        featureToggleService,
    } = services;

    if (await maintenanceService.isMaintenanceMode()) {
        schedulerService.pause();
    }

    schedulerService.schedule(
        apiTokenService.fetchActiveTokens.bind(apiTokenService),
        minutesToMilliseconds(1),
        'fetchActiveTokens',
    );

    schedulerService.schedule(
        apiTokenService.updateLastSeen.bind(apiTokenService),
        minutesToMilliseconds(3),
        'updateLastSeen',
    );

    schedulerService.schedule(
        instanceStatsService.refreshStatsSnapshot.bind(instanceStatsService),
        minutesToMilliseconds(5),
        'refreshStatsSnapshot',
    );

    schedulerService.schedule(
        clientInstanceService.removeInstancesOlderThanTwoDays.bind(
            clientInstanceService,
        ),
        hoursToMilliseconds(24),
        'removeInstancesOlderThanTwoDays',
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
};

export const createServices = (
    stores: IUnleashStores,
    config: IUnleashConfig,
    db?: Db,
): IUnleashServices => {
    const groupService = new GroupService(stores, config);
    const accessService = new AccessService(stores, config, groupService);
    const apiTokenService = new ApiTokenService(stores, config);
    const lastSeenService = new LastSeenService(stores, config);
    const clientMetricsServiceV2 = new ClientMetricsServiceV2(
        stores,
        config,
        lastSeenService,
    );
    const privateProjectChecker = db
        ? createPrivateProjectChecker(db, config)
        : createFakePrivateProjectChecker();

    const contextService = new ContextService(
        stores,
        config,
        privateProjectChecker,
    );
    const emailService = new EmailService(config.email, config.getLogger);
    const eventService = new EventService(stores, config);
    const featureTypeService = new FeatureTypeService(stores, config);
    const resetTokenService = new ResetTokenService(stores, config);
    const stateService = new StateService(stores, config);
    const strategyService = new StrategyService(stores, config);
    const tagService = new TagService(stores, config);
    const tagTypeService = new TagTypeService(stores, config);
    const addonService = new AddonService(stores, config, tagTypeService);
    const sessionService = new SessionService(stores, config);
    const settingService = new SettingService(stores, config);
    const userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
        settingService,
    });
    const accountService = new AccountService(stores, config, {
        accessService,
    });
    const versionService = new VersionService(stores, config);
    const healthService = new HealthService(stores, config);
    const userFeedbackService = new UserFeedbackService(stores, config);
    const changeRequestAccessReadModel = db
        ? createChangeRequestAccessReadModel(db, config)
        : createFakeChangeRequestAccessService();
    const segmentService = new SegmentService(
        stores,
        changeRequestAccessReadModel,
        config,
        privateProjectChecker,
    );

    const clientInstanceService = new ClientInstanceService(
        stores,
        config,
        privateProjectChecker,
    );
    const featureToggleServiceV2 = new FeatureToggleService(
        stores,
        config,
        segmentService,
        accessService,
        changeRequestAccessReadModel,
        privateProjectChecker,
    );
    const environmentService = new EnvironmentService(stores, config);
    const featureTagService = new FeatureTagService(stores, config);
    const favoritesService = new FavoritesService(stores, config);
    const projectService = new ProjectService(
        stores,
        config,
        accessService,
        featureToggleServiceV2,
        groupService,
        favoritesService,
        privateProjectChecker,
    );
    const projectHealthService = new ProjectHealthService(
        stores,
        config,
        projectService,
    );

    // TODO: this is a temporary seam to enable packaging by feature
    const exportImportService = db
        ? createExportImportTogglesService(db, config)
        : createFakeExportImportTogglesService(config);
    const transactionalExportImportService = (txDb: Knex.Transaction) =>
        createExportImportTogglesService(txDb, config);
    const transactionalFeatureToggleService = (txDb: Knex.Transaction) =>
        createFeatureToggleService(txDb, config);
    const transactionalGroupService = (txDb: Knex.Transaction) =>
        createGroupService(txDb, config);
    const userSplashService = new UserSplashService(stores, config);
    const openApiService = new OpenApiService(config);
    const clientSpecService = new ClientSpecService(config);
    const playgroundService = new PlaygroundService(config, {
        featureToggleServiceV2,
        segmentService,
        privateProjectChecker,
    });

    const configurationRevisionService = new ConfigurationRevisionService(
        stores,
        config,
    );

    const proxyService = new ProxyService(config, stores, {
        featureToggleServiceV2,
        clientMetricsServiceV2,
        segmentService,
        settingService,
        configurationRevisionService,
    });

    const edgeService = new EdgeService(stores, config);

    const patService = new PatService(stores, config);

    const publicSignupTokenService = new PublicSignupTokenService(
        stores,
        config,
        userService,
    );

    const instanceStatsService = new InstanceStatsService(
        stores,
        config,
        versionService,
        db ? createGetActiveUsers(db) : createFakeGetActiveUsers(),
    );

    const schedulerService = new SchedulerService(config.getLogger);

    const maintenanceService = new MaintenanceService(
        stores,
        config,
        settingService,
        schedulerService,
    );

    const eventAnnouncerService = new EventAnnouncerService(stores, config);

    const dependentFeaturesService = new DependentFeaturesService(
        stores.dependentFeaturesStore,
    );
    const transactionalDependentFeaturesService = (txDb: Knex.Transaction) =>
        createDependentFeaturesService(txDb);

    return {
        accessService,
        accountService,
        addonService,
        eventAnnouncerService,
        featureToggleService: featureToggleServiceV2,
        featureToggleServiceV2,
        featureTypeService,
        healthService,
        projectService,
        stateService,
        strategyService,
        tagTypeService,
        tagService,
        clientInstanceService,
        clientMetricsServiceV2,
        contextService,
        versionService,
        apiTokenService,
        emailService,
        userService,
        resetTokenService,
        eventService,
        environmentService,
        settingService,
        sessionService,
        userFeedbackService,
        featureTagService,
        projectHealthService,
        userSplashService,
        segmentService,
        openApiService,
        clientSpecService,
        playgroundService,
        groupService,
        proxyService,
        edgeService,
        patService,
        publicSignupTokenService,
        lastSeenService,
        instanceStatsService,
        favoritesService,
        maintenanceService,
        exportImportService,
        transactionalExportImportService,
        schedulerService,
        configurationRevisionService,
        transactionalFeatureToggleService,
        transactionalGroupService,
        privateProjectChecker,
        dependentFeaturesService,
        transactionalDependentFeaturesService,
    };
};

export {
    FeatureTypeService,
    EventService,
    HealthService,
    ProjectService,
    StateService,
    ClientInstanceService,
    ClientMetricsServiceV2,
    TagTypeService,
    TagService,
    StrategyService,
    AddonService,
    ContextService,
    VersionService,
    EmailService,
    AccessService,
    ApiTokenService,
    UserService,
    ResetTokenService,
    SettingService,
    SessionService,
    UserFeedbackService,
    FeatureToggleService,
    EnvironmentService,
    FeatureTagService,
    ProjectHealthService,
    UserSplashService,
    SegmentService,
    OpenApiService,
    ClientSpecService,
    PlaygroundService,
    GroupService,
    ProxyService,
    EdgeService,
    PatService,
    PublicSignupTokenService,
    LastSeenService,
    InstanceStatsService,
    FavoritesService,
    SchedulerService,
    DependentFeaturesService,
};
