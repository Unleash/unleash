import type { IUnleashConfig, IUnleashStores } from '../types/index.js';
import FeatureTypeService from './feature-type-service.js';
import EventService from '../features/events/event-service.js';
import HealthService from './health-service.js';

import ProjectService from '../features/project/project-service.js';
import ClientInstanceService from '../features/metrics/instance/instance-service.js';
import ClientMetricsServiceV2 from '../features/metrics/client-metrics/metrics-service-v2.js';
import { CustomMetricsService } from '../features/metrics/custom/custom-metrics-service.js';
import TagTypeService from '../features/tag-type/tag-type-service.js';
import TagService from './tag-service.js';
import StrategyService from './strategy-service.js';
import AddonService from './addon-service.js';
import ContextService from '../features/context/context-service.js';
import VersionService from './version-service.js';
import { EmailService } from './email-service.js';
import { AccessService } from './access-service.js';
import { ApiTokenService } from './api-token-service.js';
import UserService from './user-service.js';
import ResetTokenService from './reset-token-service.js';
import SettingService from './setting-service.js';
import SessionService from './session-service.js';
import UserFeedbackService from './user-feedback-service.js';
import { FeatureToggleService } from '../features/feature-toggle/feature-toggle-service.js';
import EnvironmentService from '../features/project-environments/environment-service.js';
import FeatureTagService from './feature-tag-service.js';
import ProjectHealthService from './project-health-service.js';
import UserSplashService from './user-splash-service.js';
import { SegmentService } from '../features/segment/segment-service.js';
import { OpenApiService } from './openapi-service.js';
import { ClientSpecService } from './client-spec-service.js';
import { PlaygroundService } from '../features/playground/playground-service.js';
import { GroupService } from './group-service.js';
import { FrontendApiService } from '../features/frontend-api/frontend-api-service.js';
import EdgeService from './edge-service.js';
import PatService from './pat-service.js';
import { PublicSignupTokenService } from './public-signup-token-service.js';
import { LastSeenService } from '../features/metrics/last-seen/last-seen-service.js';
import { InstanceStatsService } from '../features/instance-stats/instance-stats-service.js';
import { FavoritesService } from './favorites-service.js';
import MaintenanceService from '../features/maintenance/maintenance-service.js';
import { AccountService } from './account-service.js';
import { SchedulerService } from '../features/scheduler/scheduler-service.js';
import { ProjectInsightsService } from '../features/project-insights/project-insights-service.js';
import type { Knex } from 'knex';
import {
    createExportImportTogglesService,
    createFakeExportImportTogglesService,
    deferredExportImportTogglesService,
} from '../features/export-import-toggles/createExportImportService.js';
import type { Db } from '../db/db.js';
import {
    withFakeTransactional,
    type WithTransactional,
    withTransactional,
} from '../db/transaction.js';
import {
    createChangeRequestAccessReadModel,
    createFakeChangeRequestAccessService,
} from '../features/change-request-access-service/createChangeRequestAccessReadModel.js';
import {
    createChangeRequestSegmentUsageReadModel,
    createFakeChangeRequestSegmentUsageReadModel,
} from '../features/change-request-segment-usage-service/createChangeRequestSegmentUsageReadModel.js';
import ConfigurationRevisionService from '../features/feature-toggle/configuration-revision-service.js';
import {
    createAccessService,
    createEnvironmentService,
    createEventsService,
    createFakeAccessService,
    createFakeEnvironmentService,
    createFakeEventsService,
    createFakeFeatureLinkService,
    createFakeFeatureToggleService,
    createFakeProjectService,
    createFakeUserSubscriptionsService,
    createFeatureLifecycleService,
    createFeatureLinkService,
    createFeatureToggleService,
    createProjectService,
    createUserSubscriptionsService,
} from '../features/index.js';
import EventAnnouncerService from './event-announcer-service.js';
import { createGroupService } from '../features/group/createGroupService.js';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from '../features/private-project/createPrivateProjectChecker.js';
import { DependentFeaturesService } from '../features/dependent-features/dependent-features-service.js';
import {
    createDependentFeaturesService,
    createFakeDependentFeaturesService,
} from '../features/dependent-features/createDependentFeaturesService.js';
import {
    createFakeLastSeenService,
    createLastSeenService,
} from '../features/metrics/last-seen/createLastSeenService.js';
import {
    createClientFeatureToggleService,
    createFakeClientFeatureToggleService,
} from '../features/client-feature-flags/createClientFeatureToggleService.js';
import { ClientFeatureToggleService } from '../features/client-feature-flags/client-feature-toggle-service.js';
import {
    createFakeFeatureSearchService,
    createFeatureSearchService,
} from '../features/feature-search/createFeatureSearchService.js';
import { FeatureSearchService } from '../features/feature-search/feature-search-service.js';
import {
    createFakeTagTypeService,
    createTagTypeService,
} from '../features/tag-type/createTagTypeService.js';
import {
    createFakeInstanceStatsService,
    createInstanceStatsService,
} from '../features/instance-stats/createInstanceStatsService.js';
import { InactiveUsersService } from '../users/inactive/inactive-users-service.js';
import {
    createFakeFrontendApiService,
    createFrontendApiService,
} from '../features/frontend-api/createFrontendApiService.js';
import {
    createFakeProjectInsightsService,
    createProjectInsightsService,
} from '../features/project-insights/createProjectInsightsService.js';
import { JobService } from '../features/scheduler/job-service.js';
import { UserSubscriptionsService } from '../features/user-subscriptions/user-subscriptions-service.js';
import { JobStore } from '../features/scheduler/job-store.js';
import { FeatureLifecycleService } from '../features/feature-lifecycle/feature-lifecycle-service.js';
import { createFakeFeatureLifecycleService } from '../features/feature-lifecycle/createFeatureLifecycle.js';
import { FeatureLifecycleReadModel } from '../features/feature-lifecycle/feature-lifecycle-read-model.js';
import { FakeFeatureLifecycleReadModel } from '../features/feature-lifecycle/fake-feature-lifecycle-read-model.js';
import {
    createApiTokenService,
    createFakeApiTokenService,
} from '../features/api-tokens/createApiTokenService.js';
import { IntegrationEventsService } from '../features/integration-events/integration-events-service.js';
import {
    createFakePlaygroundService,
    createPlaygroundService,
} from '../features/playground/createPlaygroundService.js';
import {
    createFakeOnboardingService,
    createOnboardingService,
} from '../features/onboarding/createOnboardingService.js';
import { OnboardingService } from '../features/onboarding/onboarding-service.js';
import { PersonalDashboardService } from '../features/personal-dashboard/personal-dashboard-service.js';
import {
    createFakePersonalDashboardService,
    createPersonalDashboardService,
} from '../features/personal-dashboard/createPersonalDashboardService.js';
import {
    createFakeProjectStatusService,
    createProjectStatusService,
} from '../features/project-status/createProjectStatusService.js';
import { ProjectStatusService } from '../features/project-status/project-status-service.js';
import {
    createContextService,
    createFakeContextService,
} from '../features/context/createContextService.js';
import { UniqueConnectionService } from '../features/unique-connection/unique-connection-service.js';
import type {
    IFeatureLifecycleReadModel,
    ISegmentService,
} from '../internals.js';
import type {
    IExportService,
    IImportService,
} from '../features/export-import-toggles/export-import-service.js';
import type { IPrivateProjectChecker } from '../features/private-project/privateProjectCheckerType.js';
import { UnknownFlagsService } from '../features/metrics/unknown-flags/unknown-flags-service.js';
import type FeatureLinkService from '../features/feature-links/feature-link-service.js';
import { createUserService } from '../features/users/createUserService.js';
import { UiConfigService } from '../ui-config/ui-config-service.js';
import { ResourceLimitsService } from '../features/resource-limits/resource-limits-service.js';

export const createServices = (
    stores: IUnleashStores,
    config: IUnleashConfig,
    db?: Db,
): IUnleashServices => {
    const privateProjectChecker = db
        ? createPrivateProjectChecker(db, config)
        : createFakePrivateProjectChecker();

    const eventService = db
        ? createEventsService(db, config)
        : createFakeEventsService(config, stores);
    const groupService = new GroupService(stores, config, eventService);

    const transactionalAccessService = db
        ? withTransactional((db) => createAccessService(db, config), db)
        : withFakeTransactional(createFakeAccessService(config).accessService);

    const accessService = new AccessService(
        stores,
        config,
        groupService,
        eventService,
    );
    const apiTokenService = db
        ? createApiTokenService(db, config)
        : createFakeApiTokenService(config).apiTokenService;
    const lastSeenService = db
        ? createLastSeenService(db, config)
        : createFakeLastSeenService(config);

    const unknownFlagsService = new UnknownFlagsService(stores, config);

    const resourceLimitsService = new ResourceLimitsService(config);

    // Initialize custom metrics service
    const customMetricsService = new CustomMetricsService(config);

    const clientMetricsServiceV2 = new ClientMetricsServiceV2(
        stores,
        config,
        lastSeenService,
        unknownFlagsService,
    );

    const featureLifecycleReadModel = db
        ? new FeatureLifecycleReadModel(db)
        : new FakeFeatureLifecycleReadModel();

    const transactionalContextService = db
        ? withTransactional(createContextService(config), db)
        : withFakeTransactional(createFakeContextService(config));
    const contextService = transactionalContextService;
    const emailService = new EmailService(config);
    const featureTypeService = new FeatureTypeService(
        stores,
        config,
        eventService,
    );
    const resetTokenService = new ResetTokenService(stores, config);
    const strategyService = new StrategyService(stores, config, eventService);
    const tagService = new TagService(stores, config, eventService);
    const transactionalTagTypeService = db
        ? withTransactional(createTagTypeService(config), db)
        : withFakeTransactional(createFakeTagTypeService(config));
    const tagTypeService = transactionalTagTypeService;
    const integrationEventsService = new IntegrationEventsService(
        stores,
        config,
    );
    const addonService = new AddonService(
        stores,
        config,
        tagTypeService,
        eventService,
        integrationEventsService,
    );
    const sessionService = new SessionService(stores, config);
    const settingService = new SettingService(stores, config, eventService);
    const userService = db
        ? withTransactional((db) => createUserService(db, config), db)
        : withFakeTransactional(
              new UserService(stores, config, {
                  accessService,
                  resetTokenService,
                  emailService,
                  eventService,
                  sessionService,
                  settingService,
              }),
          );
    const accountService = new AccountService(stores, config, {
        accessService,
    });

    const versionService = new VersionService(stores, config);
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
        resourceLimitsService,
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
        : createFakeProjectService(config).projectService;
    const transactionalProjectService = db
        ? withTransactional((db: Db) => createProjectService(db, config), db)
        : withFakeTransactional(
              createFakeProjectService(config).projectService,
          );
    const projectInsightsService = db
        ? createProjectInsightsService(db, config)
        : createFakeProjectInsightsService().projectInsightsService;

    const projectStatusService = db
        ? createProjectStatusService(db, config)
        : createFakeProjectStatusService().projectStatusService;

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

    const transactionalFeatureLinkService = db
        ? withTransactional(createFeatureLinkService(config), db)
        : withFakeTransactional(
              createFakeFeatureLinkService(config).featureLinkService,
          );

    const featureLinkService = transactionalFeatureLinkService;

    const featureToggleService = db
        ? withTransactional((db) => createFeatureToggleService(db, config), db)
        : withFakeTransactional(
              createFakeFeatureToggleService(config).featureToggleService,
          );
    const transactionalFeatureToggleService = featureToggleService;
    const transactionalGroupService = (txDb: Knex.Transaction) =>
        createGroupService(txDb, config);
    const userSplashService = new UserSplashService(stores, config);
    const openApiService = new OpenApiService(config);
    const clientSpecService = new ClientSpecService(config);
    const playgroundService = db
        ? createPlaygroundService(db, config)
        : createFakePlaygroundService(config);

    const configurationRevisionService =
        ConfigurationRevisionService.getInstance(stores, config);

    const clientFeatureToggleService = db
        ? createClientFeatureToggleService(db, config)
        : createFakeClientFeatureToggleService(config);

    const frontendApiService = db
        ? createFrontendApiService(
              db,
              config,
              clientMetricsServiceV2,
              configurationRevisionService,
              clientInstanceService,
          )
        : createFakeFrontendApiService(
              config,
              clientMetricsServiceV2,
              configurationRevisionService,
              clientInstanceService,
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

    const jobService = new JobService(
        new JobStore(db!, config),
        config.getLogger,
    );

    const transactionalFeatureLifecycleService = db
        ? withTransactional(createFeatureLifecycleService(config), db)
        : withFakeTransactional(
              createFakeFeatureLifecycleService(config).featureLifecycleService,
          );
    const featureLifecycleService = transactionalFeatureLifecycleService;
    featureLifecycleService.listen();

    const uniqueConnectionService = new UniqueConnectionService(stores, config);
    uniqueConnectionService.listen();

    const onboardingService = db
        ? createOnboardingService(config)(db)
        : createFakeOnboardingService(config).onboardingService;
    onboardingService.listen();

    const personalDashboardService = db
        ? createPersonalDashboardService(db, config, stores)
        : createFakePersonalDashboardService(config);

    const transactionalUserSubscriptionsService = db
        ? withTransactional(createUserSubscriptionsService(config), db)
        : withFakeTransactional(createFakeUserSubscriptionsService(config));

    const uiConfigService = new UiConfigService(config, {
        versionService,
        settingService,
        emailService,
        frontendApiService,
        maintenanceService,
        sessionService,
        resourceLimitsService,
    });

    return {
        transactionalAccessService,
        accessService,
        accountService,
        addonService,
        eventAnnouncerService,
        featureToggleService,
        featureTypeService,
        healthService,
        projectService,
        transactionalProjectService,
        strategyService,
        tagTypeService,
        transactionalTagTypeService,
        tagService,
        clientInstanceService,
        clientMetricsServiceV2,
        customMetricsService,
        contextService,
        transactionalContextService,
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
        frontendApiService,
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
        projectInsightsService,
        jobService,
        featureLifecycleService,
        transactionalFeatureLifecycleService,
        integrationEventsService,
        onboardingService,
        personalDashboardService,
        projectStatusService,
        transactionalUserSubscriptionsService,
        uniqueConnectionService,
        featureLifecycleReadModel,
        transactionalFeatureLinkService,
        featureLinkService,
        unknownFlagsService,
        uiConfigService,
        resourceLimitsService,
    };
};

export {
    FeatureTypeService,
    EventService,
    HealthService,
    ProjectService,
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
    FrontendApiService,
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
    ProjectInsightsService,
    JobService,
    FeatureLifecycleService,
    IntegrationEventsService,
    OnboardingService,
    PersonalDashboardService,
    ProjectStatusService,
    UserSubscriptionsService,
    UniqueConnectionService,
    FeatureLifecycleReadModel,
    UnknownFlagsService,
    UiConfigService,
    ResourceLimitsService,
};

export interface IUnleashServices {
    transactionalAccessService: WithTransactional<AccessService>;
    accessService: AccessService;
    accountService: AccountService;
    addonService: AddonService;
    apiTokenService: ApiTokenService;
    clientInstanceService: ClientInstanceService;
    clientMetricsServiceV2: ClientMetricsServiceV2;
    customMetricsService: CustomMetricsService;
    contextService: ContextService;
    transactionalContextService: WithTransactional<ContextService>;
    emailService: EmailService;
    environmentService: EnvironmentService;
    transactionalEnvironmentService: WithTransactional<EnvironmentService>;
    eventService: EventService;
    edgeService: EdgeService;
    featureTagService: FeatureTagService;
    featureToggleService: FeatureToggleService;
    featureTypeService: FeatureTypeService;
    groupService: GroupService;
    healthService: HealthService;
    projectHealthService: ProjectHealthService;
    projectService: ProjectService;
    transactionalProjectService: WithTransactional<ProjectService>;
    playgroundService: PlaygroundService;
    frontendApiService: FrontendApiService;
    publicSignupTokenService: PublicSignupTokenService;
    resetTokenService: ResetTokenService;
    sessionService: SessionService;
    settingService: SettingService;
    strategyService: StrategyService;
    tagService: TagService;
    tagTypeService: TagTypeService;
    transactionalTagTypeService: WithTransactional<TagTypeService>;
    userFeedbackService: UserFeedbackService;
    userService: WithTransactional<UserService>;
    versionService: VersionService;
    userSplashService: UserSplashService;
    segmentService: ISegmentService;
    openApiService: OpenApiService;
    clientSpecService: ClientSpecService;
    patService: PatService;
    lastSeenService: LastSeenService;
    instanceStatsService: InstanceStatsService;
    favoritesService: FavoritesService;
    maintenanceService: MaintenanceService;
    exportService: IExportService;
    importService: WithTransactional<IImportService>;
    configurationRevisionService: ConfigurationRevisionService;
    schedulerService: SchedulerService;
    eventAnnouncerService: EventAnnouncerService;
    transactionalFeatureToggleService: WithTransactional<FeatureToggleService>;
    transactionalGroupService: (db: Knex.Transaction) => GroupService;
    privateProjectChecker: IPrivateProjectChecker;
    dependentFeaturesService: DependentFeaturesService;
    transactionalDependentFeaturesService: WithTransactional<DependentFeaturesService>;
    clientFeatureToggleService: ClientFeatureToggleService;
    featureSearchService: FeatureSearchService;
    inactiveUsersService: InactiveUsersService;
    projectInsightsService: ProjectInsightsService;
    jobService: JobService;
    featureLifecycleService: FeatureLifecycleService;
    transactionalFeatureLifecycleService: WithTransactional<FeatureLifecycleService>;
    integrationEventsService: IntegrationEventsService;
    onboardingService: OnboardingService;
    personalDashboardService: PersonalDashboardService;
    projectStatusService: ProjectStatusService;
    transactionalUserSubscriptionsService: WithTransactional<UserSubscriptionsService>;
    uniqueConnectionService: UniqueConnectionService;
    featureLifecycleReadModel: IFeatureLifecycleReadModel;
    transactionalFeatureLinkService: WithTransactional<FeatureLinkService>;
    featureLinkService: FeatureLinkService;
    unknownFlagsService: UnknownFlagsService;
    uiConfigService: UiConfigService;
    resourceLimitsService: ResourceLimitsService;
}
