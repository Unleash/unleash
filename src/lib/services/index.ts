import {
    IUnleashConfig,
    IUnleashStores,
    IUnleashServices,
    IFlagResolver,
} from '../types';
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
import FeatureToggleService from '../features/feature-toggle/feature-toggle-service';
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
import { LastSeenService } from './client-metrics/last-seen/last-seen-service';
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
    deferredExportImportTogglesService,
} from '../features/export-import-toggles/createExportImportService';
import { Db } from '../db/db';
import { withFakeTransactional, withTransactional } from '../db/transaction';
import {
    createChangeRequestAccessReadModel,
    createFakeChangeRequestAccessService,
} from '../features/change-request-access-service/createChangeRequestAccessReadModel';
import ConfigurationRevisionService from '../features/feature-toggle/configuration-revision-service';
import {
    createFakeProjectService,
    createFeatureToggleService,
    createProjectService,
} from '../features';
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
import {
    createDependentFeaturesService,
    createFakeDependentFeaturesService,
} from '../features/dependent-features/createDependentFeaturesService';
import { DependentFeaturesReadModel } from '../features/dependent-features/dependent-features-read-model';
import { FakeDependentFeaturesReadModel } from '../features/dependent-features/fake-dependent-features-read-model';
import {
    createFakeLastSeenService,
    createLastSeenService,
} from './client-metrics/last-seen/createLastSeenService';
import {
    createFakeGetProductionChanges,
    createGetProductionChanges,
} from '../features/instance-stats/getProductionChanges';
import {
    createClientFeatureToggleService,
    createFakeClientFeatureToggleService,
} from '../features/client-feature-toggles/createClientFeatureToggleService';
import { ClientFeatureToggleService } from '../features/client-feature-toggles/client-feature-toggle-service';

// TODO: will be moved to scheduler feature directory
export const scheduleServices = async (
    services: IUnleashServices,
    flagResolver: IFlagResolver,
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
        versionService,
        lastSeenService,
        proxyService,
        clientMetricsServiceV2,
    } = services;

    if (await maintenanceService.isMaintenanceMode()) {
        schedulerService.pause();
    }

    if (flagResolver.isEnabled('useLastSeenRefactor')) {
        schedulerService.schedule(
            lastSeenService.cleanLastSeen.bind(lastSeenService),
            hoursToMilliseconds(1),
            'cleanLastSeen',
        );
    }

    schedulerService.schedule(
        lastSeenService.store.bind(lastSeenService),
        secondsToMilliseconds(30),
        'storeLastSeen',
    );

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
        proxyService.fetchFrontendSettings.bind(proxyService),
        minutesToMilliseconds(2),
        'fetchFrontendSettings',
    );

    schedulerService.schedule(
        () => {
            clientMetricsServiceV2.bulkAdd().catch(console.error);
        },
        secondsToMilliseconds(5),
        'bulkAddMetrics',
    );

    schedulerService.schedule(
        () => {
            clientMetricsServiceV2.clearMetrics(48).catch(console.error);
        },
        hoursToMilliseconds(12),
        'clearMetrics',
    );
};

export const createServices = (
    stores: IUnleashStores,
    config: IUnleashConfig,
    db?: Db,
): IUnleashServices => {
    const eventService = new EventService(stores, config);
    const groupService = new GroupService(stores, config, eventService);
    const accessService = new AccessService(stores, config, groupService);
    const apiTokenService = new ApiTokenService(stores, config, eventService);
    const lastSeenService = db
        ? createLastSeenService(db, config)
        : createFakeLastSeenService(config);
    const clientMetricsServiceV2 = new ClientMetricsServiceV2(
        stores,
        config,
        lastSeenService,
    );
    const privateProjectChecker = db
        ? createPrivateProjectChecker(db, config)
        : createFakePrivateProjectChecker();
    const dependentFeaturesReadModel = db
        ? new DependentFeaturesReadModel(db)
        : new FakeDependentFeaturesReadModel();

    const contextService = new ContextService(
        stores,
        config,
        eventService,
        privateProjectChecker,
    );
    const emailService = new EmailService(config.email, config.getLogger);
    const featureTypeService = new FeatureTypeService(stores, config);
    const resetTokenService = new ResetTokenService(stores, config);
    const stateService = new StateService(stores, config, eventService);
    const strategyService = new StrategyService(stores, config, eventService);
    const tagService = new TagService(stores, config, eventService);
    const tagTypeService = new TagTypeService(stores, config, eventService);
    const addonService = new AddonService(
        stores,
        config,
        tagTypeService,
        eventService,
    );
    const sessionService = new SessionService(stores, config);
    const settingService = new SettingService(stores, config, eventService);
    const userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    const accountService = new AccountService(stores, config, {
        accessService,
    });
    const getActiveUsers = db
        ? createGetActiveUsers(db)
        : createFakeGetActiveUsers();
    const getProductionChanges = db
        ? createGetProductionChanges(db)
        : createFakeGetProductionChanges();

    const versionService = new VersionService(
        stores,
        config,
        getActiveUsers,
        getProductionChanges,
    );
    const healthService = new HealthService(stores, config);
    const userFeedbackService = new UserFeedbackService(stores, config);
    const changeRequestAccessReadModel = db
        ? createChangeRequestAccessReadModel(db, config)
        : createFakeChangeRequestAccessService();
    const segmentService = new SegmentService(
        stores,
        changeRequestAccessReadModel,
        config,
        eventService,
        privateProjectChecker,
    );

    const clientInstanceService = new ClientInstanceService(
        stores,
        config,
        privateProjectChecker,
    );

    const transactionalDependentFeaturesService = db
        ? withTransactional(createDependentFeaturesService(config), db)
        : withFakeTransactional(createFakeDependentFeaturesService(config));
    const dependentFeaturesService = transactionalDependentFeaturesService;

    const featureToggleServiceV2 = new FeatureToggleService(
        stores,
        config,
        segmentService,
        accessService,
        eventService,
        changeRequestAccessReadModel,
        privateProjectChecker,
        dependentFeaturesReadModel,
        dependentFeaturesService,
    );
    const environmentService = new EnvironmentService(stores, config);
    const featureTagService = new FeatureTagService(
        stores,
        config,
        eventService,
    );
    const favoritesService = new FavoritesService(stores, config, eventService);
    const projectService = db
        ? createProjectService(db, config)
        : createFakeProjectService(config);

    const projectHealthService = new ProjectHealthService(
        stores,
        config,
        projectService,
    );

    const exportImportService = db
        ? createExportImportTogglesService(db, config)
        : createFakeExportImportTogglesService(config);
    const importService = db
        ? withTransactional(deferredExportImportTogglesService(config), db)
        : withFakeTransactional(createFakeExportImportTogglesService(config));
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

    const clientFeatureToggleService = db
        ? createClientFeatureToggleService(db, config)
        : createFakeClientFeatureToggleService(config);

    const proxyService = new ProxyService(config, stores, {
        featureToggleServiceV2,
        clientMetricsServiceV2,
        segmentService,
        settingService,
        configurationRevisionService,
    });

    const edgeService = new EdgeService(stores, config);

    const patService = new PatService(stores, config, eventService);

    const publicSignupTokenService = new PublicSignupTokenService(
        stores,
        config,
        userService,
        eventService,
    );

    const instanceStatsService = new InstanceStatsService(
        stores,
        config,
        versionService,
        db ? createGetActiveUsers(db) : createFakeGetActiveUsers(),
        db ? createGetProductionChanges(db) : createFakeGetProductionChanges(),
    );

    const schedulerService = new SchedulerService(config.getLogger);

    const maintenanceService = new MaintenanceService(
        stores,
        config,
        settingService,
        schedulerService,
    );

    const eventAnnouncerService = new EventAnnouncerService(stores, config);

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
        exportService: exportImportService,
        importService,
        schedulerService,
        configurationRevisionService,
        transactionalFeatureToggleService,
        transactionalGroupService,
        privateProjectChecker,
        dependentFeaturesService,
        transactionalDependentFeaturesService,
        clientFeatureToggleService,
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
    ClientFeatureToggleService,
};
