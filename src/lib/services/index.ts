import { IUnleashConfig, IUnleashServices, IUnleashStores } from '../types';
import FeatureTypeService from './feature-type-service';
import EventService from '../features/events/event-service';
import HealthService from './health-service';

import ProjectService from '../features/project/project-service';
import StateService from './state-service';
import ClientInstanceService from '../features/metrics/instance/instance-service';
import ClientMetricsServiceV2 from '../features/metrics/client-metrics/metrics-service-v2';
import TagTypeService from '../features/tag-type/tag-type-service';
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
import EnvironmentService from '../features/project-environments/environment-service';
import FeatureTagService from './feature-tag-service';
import ProjectHealthService from './project-health-service';
import UserSplashService from './user-splash-service';
import { SegmentService } from '../features/segment/segment-service';
import { OpenApiService } from './openapi-service';
import { ClientSpecService } from './client-spec-service';
import { PlaygroundService } from '../features/playground/playground-service';
import { GroupService } from './group-service';
import { ProxyService } from './proxy-service';
import EdgeService from './edge-service';
import PatService from './pat-service';
import { PublicSignupTokenService } from './public-signup-token-service';
import { LastSeenService } from '../features/metrics/last-seen/last-seen-service';
import { InstanceStatsService } from '../features/instance-stats/instance-stats-service';
import { FavoritesService } from './favorites-service';
import MaintenanceService from '../features/maintenance/maintenance-service';
import { AccountService } from './account-service';
import { SchedulerService } from '../features/scheduler/scheduler-service';
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
import {
    createChangeRequestSegmentUsageReadModel,
    createFakeChangeRequestSegmentUsageReadModel,
} from '../features/change-request-segment-usage-service/createChangeRequestSegmentUsageReadModel';
import ConfigurationRevisionService from '../features/feature-toggle/configuration-revision-service';
import {
    createEnvironmentService,
    createFakeEnvironmentService,
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
} from '../features/metrics/last-seen/createLastSeenService';
import {
    createFakeGetProductionChanges,
    createGetProductionChanges,
} from '../features/instance-stats/getProductionChanges';
import {
    createClientFeatureToggleService,
    createFakeClientFeatureToggleService,
} from '../features/client-feature-toggles/createClientFeatureToggleService';
import { ClientFeatureToggleService } from '../features/client-feature-toggles/client-feature-toggle-service';
import {
    createFakeFeatureSearchService,
    createFeatureSearchService,
} from '../features/feature-search/createFeatureSearchService';
import { FeatureSearchService } from '../features/feature-search/feature-search-service';
import {
    createFakeTagTypeService,
    createTagTypeService,
} from '../features/tag-type/createTagTypeService';
import {
    createFakeInstanceStatsService,
    createInstanceStatsService,
} from '../features/instance-stats/createInstanceStatsService';
import { InactiveUsersService } from '../users/inactive/inactive-users-service';
import { SegmentReadModel } from '../features/segment/segment-read-model';
import { FakeSegmentReadModel } from '../features/segment/fake-segment-read-model';
import { GlobalFrontendApiCache } from '../proxy/global-frontend-api-cache';
import ClientFeatureToggleReadModel from '../proxy/client-feature-toggle-read-model';
import FakeClientFeatureToggleReadModel from '../proxy/fake-client-feature-toggle-read-model';

export const createServices = (
    stores: IUnleashStores,
    config: IUnleashConfig,
    db?: Db,
): IUnleashServices => {
    const eventService = new EventService(stores, config);
    const groupService = new GroupService(stores, config, eventService);
    const accessService = new AccessService(
        stores,
        config,
        groupService,
        eventService,
    );
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
    const segmentReadModel = db
        ? new SegmentReadModel(db)
        : new FakeSegmentReadModel();

    const contextService = new ContextService(
        stores,
        config,
        eventService,
        privateProjectChecker,
    );
    const emailService = new EmailService(config);
    const featureTypeService = new FeatureTypeService(
        stores,
        config,
        eventService,
    );
    const resetTokenService = new ResetTokenService(stores, config);
    const stateService = new StateService(stores, config, eventService);
    const strategyService = new StrategyService(stores, config, eventService);
    const tagService = new TagService(stores, config, eventService);
    const transactionalTagTypeService = db
        ? withTransactional(createTagTypeService(config), db)
        : withFakeTransactional(createFakeTagTypeService(config));
    const tagTypeService = transactionalTagTypeService;
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

    const changeRequestSegmentUsageReadModel = db
        ? createChangeRequestSegmentUsageReadModel(db)
        : createFakeChangeRequestSegmentUsageReadModel();

    const segmentService = new SegmentService(
        stores,
        changeRequestAccessReadModel,
        changeRequestSegmentUsageReadModel,
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

    const featureSearchService = db
        ? createFeatureSearchService(config)(db)
        : createFakeFeatureSearchService(config);

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
    const transactionalEnvironmentService = db
        ? withTransactional(createEnvironmentService(config), db)
        : withFakeTransactional(createFakeEnvironmentService(config));
    const environmentService = transactionalEnvironmentService;

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
    const playgroundService = new PlaygroundService(
        config,
        {
            featureToggleServiceV2,
            privateProjectChecker,
        },
        segmentReadModel,
    );

    const configurationRevisionService = new ConfigurationRevisionService(
        stores,
        config,
    );

    const clientFeatureToggleService = db
        ? createClientFeatureToggleService(db, config)
        : createFakeClientFeatureToggleService(config);

    const clientFeatureToggleReadModel = db
        ? new ClientFeatureToggleReadModel(db, config.eventBus)
        : new FakeClientFeatureToggleReadModel();
    const globalFrontendApiCache = new GlobalFrontendApiCache(
        config,
        segmentReadModel,
        clientFeatureToggleReadModel,
        configurationRevisionService,
    );

    const proxyService = new ProxyService(
        config,
        stores,
        {
            featureToggleServiceV2,
            clientMetricsServiceV2,
            settingService,
            configurationRevisionService,
        },
        globalFrontendApiCache,
    );

    const edgeService = new EdgeService({ apiTokenService }, config);

    const patService = new PatService(stores, config, eventService);

    const publicSignupTokenService = new PublicSignupTokenService(
        stores,
        config,
        userService,
        eventService,
    );

    const instanceStatsService = db
        ? createInstanceStatsService(db, config)
        : createFakeInstanceStatsService(config);

    const maintenanceService = new MaintenanceService(config, settingService);

    const schedulerService = new SchedulerService(
        config.getLogger,
        maintenanceService,
        config.eventBus,
    );

    const eventAnnouncerService = new EventAnnouncerService(stores, config);
    const inactiveUsersService = new InactiveUsersService(stores, config, {
        userService,
    });

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
        transactionalTagTypeService,
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
        transactionalEnvironmentService,
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
        featureSearchService,
        inactiveUsersService,
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
    FeatureSearchService,
};
