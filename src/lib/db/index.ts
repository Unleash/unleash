import type { IUnleashConfig, IUnleashStores } from '../types';

import EventStore from '../features/events/event-store';
import FeatureToggleStore from '../features/feature-toggle/feature-toggle-store';
import FeatureTypeStore from './feature-type-store';
import StrategyStore from './strategy-store';
import ClientInstanceStore from './client-instance-store';
import ClientApplicationsStore from './client-applications-store';
import ContextFieldStore from './context-field-store';
import SettingStore from './setting-store';
import UserStore from './user-store';
import ProjectStore from '../features/project/project-store';
import TagStore from './tag-store';
import TagTypeStore from '../features/tag-type/tag-type-store';
import AddonStore from './addon-store';
import { ApiTokenStore } from './api-token-store';
import SessionStore from './session-store';
import { AccessStore } from './access-store';
import { ResetTokenStore } from './reset-token-store';
import UserFeedbackStore from './user-feedback-store';
import FeatureStrategyStore from '../features/feature-toggle/feature-toggle-strategies-store';
import FeatureToggleClientStore from '../features/client-feature-toggles/client-feature-toggle-store';
import EnvironmentStore from '../features/project-environments/environment-store';
import FeatureTagStore from './feature-tag-store';
import { FeatureEnvironmentStore } from './feature-environment-store';
import { ClientMetricsStoreV2 } from '../features/metrics/client-metrics/client-metrics-store-v2';
import UserSplashStore from './user-splash-store';
import RoleStore from './role-store';
import SegmentStore from '../features/segment/segment-store';
import GroupStore from './group-store';
import PatStore from './pat-store';
import { PublicSignupTokenStore } from './public-signup-token-store';
import { FavoriteFeaturesStore } from './favorite-features-store';
import { FavoriteProjectsStore } from './favorite-projects-store';
import { AccountStore } from './account-store';
import ProjectStatsStore from './project-stats-store';
import type { Db } from './db';
import { ImportTogglesStore } from '../features/export-import-toggles/import-toggles-store';
import PrivateProjectStore from '../features/private-project/privateProjectStore';
import { DependentFeaturesStore } from '../features/dependent-features/dependent-features-store';
import LastSeenStore from '../features/metrics/last-seen/last-seen-store';
import FeatureSearchStore from '../features/feature-search/feature-search-store';
import { InactiveUsersStore } from '../users/inactive/inactive-users-store';
import { TrafficDataUsageStore } from '../features/traffic-data-usage/traffic-data-usage-store';
import { SegmentReadModel } from '../features/segment/segment-read-model';
import { ProjectOwnersReadModel } from '../features/project/project-owners-read-model';
import { FeatureLifecycleStore } from '../features/feature-lifecycle/feature-lifecycle-store';
import { ProjectFlagCreatorsReadModel } from '../features/project/project-flag-creators-read-model';
import { FeatureStrategiesReadModel } from '../features/feature-toggle/feature-strategies-read-model';
import { FeatureLifecycleReadModel } from '../features/feature-lifecycle/feature-lifecycle-read-model';
import { LargestResourcesReadModel } from '../features/metrics/sizes/largest-resources-read-model';
import { IntegrationEventsStore } from '../features/integration-events/integration-events-store';
import { FeatureCollaboratorsReadModel } from '../features/feature-toggle/feature-collaborators-read-model';
import { createProjectReadModel } from '../features/project/createProjectReadModel';
import { OnboardingReadModel } from '../features/onboarding/onboarding-read-model';

export const createStores = (
    config: IUnleashConfig,
    db: Db,
): IUnleashStores => {
    const { getLogger, eventBus } = config;
    const eventStore = new EventStore(db, getLogger);

    return {
        eventStore,
        featureToggleStore: new FeatureToggleStore(
            db,
            eventBus,
            getLogger,
            config.flagResolver,
        ),
        featureTypeStore: new FeatureTypeStore(db, getLogger),
        strategyStore: new StrategyStore(db, getLogger),
        clientApplicationsStore: new ClientApplicationsStore(
            db,
            eventBus,
            getLogger,
            config.flagResolver,
        ),
        clientInstanceStore: new ClientInstanceStore(db, eventBus, getLogger),
        clientMetricsStoreV2: new ClientMetricsStoreV2(
            db,
            getLogger,
            config.flagResolver,
        ),
        contextFieldStore: new ContextFieldStore(
            db,
            getLogger,
            config.flagResolver,
        ),
        settingStore: new SettingStore(db, getLogger),
        userStore: new UserStore(db, getLogger, config.flagResolver),
        accountStore: new AccountStore(db, getLogger),
        projectStore: new ProjectStore(
            db,
            eventBus,
            getLogger,
            config.flagResolver,
        ),
        tagStore: new TagStore(db, eventBus, getLogger),
        tagTypeStore: new TagTypeStore(db, eventBus, getLogger),
        addonStore: new AddonStore(db, eventBus, getLogger),
        accessStore: new AccessStore(db, eventBus, getLogger),
        apiTokenStore: new ApiTokenStore(
            db,
            eventBus,
            getLogger,
            config.flagResolver,
        ),
        resetTokenStore: new ResetTokenStore(db, eventBus, getLogger),
        sessionStore: new SessionStore(db, eventBus, getLogger),
        userFeedbackStore: new UserFeedbackStore(db, eventBus, getLogger),
        featureStrategiesStore: new FeatureStrategyStore(
            db,
            eventBus,
            getLogger,
            config.flagResolver,
        ),
        clientFeatureToggleStore: new FeatureToggleClientStore(
            db,
            eventBus,
            getLogger,
            config.flagResolver,
        ),
        environmentStore: new EnvironmentStore(db, eventBus, getLogger),
        featureTagStore: new FeatureTagStore(db, eventBus, getLogger),
        featureEnvironmentStore: new FeatureEnvironmentStore(
            db,
            eventBus,
            getLogger,
        ),
        userSplashStore: new UserSplashStore(db, eventBus, getLogger),
        roleStore: new RoleStore(db, eventBus, getLogger),
        segmentStore: new SegmentStore(
            db,
            eventBus,
            getLogger,
            config.flagResolver,
        ),
        groupStore: new GroupStore(db),
        publicSignupTokenStore: new PublicSignupTokenStore(
            db,
            eventBus,
            getLogger,
        ),
        patStore: new PatStore(db, getLogger),
        favoriteFeaturesStore: new FavoriteFeaturesStore(
            db,
            eventBus,
            getLogger,
        ),
        favoriteProjectsStore: new FavoriteProjectsStore(
            db,
            eventBus,
            getLogger,
        ),
        projectStatsStore: new ProjectStatsStore(db, eventBus, getLogger),
        importTogglesStore: new ImportTogglesStore(db),
        privateProjectStore: new PrivateProjectStore(db, getLogger),
        dependentFeaturesStore: new DependentFeaturesStore(db),
        lastSeenStore: new LastSeenStore(db, eventBus, getLogger),
        featureSearchStore: new FeatureSearchStore(
            db,
            eventBus,
            getLogger,
            config.flagResolver,
        ),
        inactiveUsersStore: new InactiveUsersStore(db, eventBus, getLogger),
        trafficDataUsageStore: new TrafficDataUsageStore(db, getLogger),
        segmentReadModel: new SegmentReadModel(db),
        projectOwnersReadModel: new ProjectOwnersReadModel(db),
        projectFlagCreatorsReadModel: new ProjectFlagCreatorsReadModel(db),
        featureLifecycleStore: new FeatureLifecycleStore(db),
        featureStrategiesReadModel: new FeatureStrategiesReadModel(db),
        onboardingReadModel: new OnboardingReadModel(db),
        featureLifecycleReadModel: new FeatureLifecycleReadModel(
            db,
            config.flagResolver,
        ),
        largestResourcesReadModel: new LargestResourcesReadModel(db),
        integrationEventsStore: new IntegrationEventsStore(db, { eventBus }),
        featureCollaboratorsReadModel: new FeatureCollaboratorsReadModel(db),
        projectReadModel: createProjectReadModel(
            db,
            eventBus,
            config.flagResolver,
        ),
    };
};

module.exports = {
    createStores,
};
