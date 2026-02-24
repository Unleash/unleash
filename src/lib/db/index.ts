import {
    type IUnleashConfig,
    type IUnleashStores,
    ReleasePlanMilestoneStore,
    ReleasePlanStore,
    ReleasePlanTemplateStore,
} from '../types/index.js';

import { EventStore } from '../features/events/event-store.js';
import FeatureToggleStore from '../features/feature-toggle/feature-toggle-store.js';
import FeatureTypeStore from './feature-type-store.js';
import StrategyStore from './strategy-store.js';
import ClientInstanceStore from './client-instance-store.js';
import ClientApplicationsStore from './client-applications-store.js';
import ContextFieldStore from '../features/context/context-field-store.js';
import SettingStore from './setting-store.js';
import { UserStore } from '../features/users/user-store.js';
import ProjectStore from '../features/project/project-store.js';
import TagStore from './tag-store.js';
import TagTypeStore from '../features/tag-type/tag-type-store.js';
import AddonStore from './addon-store.js';
import { ApiTokenStore } from './api-token-store.js';
import SessionStore from './session-store.js';
import { AccessStore } from './access-store.js';
import { ResetTokenStore } from './reset-token-store.js';
import UserFeedbackStore from './user-feedback-store.js';
import FeatureStrategyStore from '../features/feature-toggle/feature-toggle-strategies-store.js';
import FeatureToggleClientStore from '../features/client-feature-toggles/client-feature-toggle-store.js';
import EnvironmentStore from '../features/project-environments/environment-store.js';
import FeatureTagStore from './feature-tag-store.js';
import { FeatureEnvironmentStore } from './feature-environment-store.js';
import { ClientMetricsStoreV2 } from '../features/metrics/client-metrics/client-metrics-store-v2.js';
import UserSplashStore from './user-splash-store.js';
import RoleStore from './role-store.js';
import SegmentStore from '../features/segment/segment-store.js';
import GroupStore from './group-store.js';
import PatStore from '../features/pat/pat-store.js';
import { PublicSignupTokenStore } from './public-signup-token-store.js';
import { FavoriteFeaturesStore } from './favorite-features-store.js';
import { FavoriteProjectsStore } from './favorite-projects-store.js';
import { AccountStore } from './account-store.js';
import ProjectStatsStore from './project-stats-store.js';
import type { Db } from './db.js';
import { ImportTogglesStore } from '../features/export-import-toggles/import-toggles-store.js';
import PrivateProjectStore from '../features/private-project/privateProjectStore.js';
import { DependentFeaturesStore } from '../features/dependent-features/dependent-features-store.js';
import LastSeenStore from '../features/metrics/last-seen/last-seen-store.js';
import FeatureSearchStore from '../features/feature-search/feature-search-store.js';
import { InactiveUsersStore } from '../users/inactive/inactive-users-store.js';
import { TrafficDataUsageStore } from '../features/traffic-data-usage/traffic-data-usage-store.js';
import { SegmentReadModel } from '../features/segment/segment-read-model.js';
import { ProjectOwnersReadModel } from '../features/project/project-owners-read-model.js';
import { FeatureLifecycleStore } from '../features/feature-lifecycle/feature-lifecycle-store.js';
import { ProjectFlagCreatorsReadModel } from '../features/project/project-flag-creators-read-model.js';
import { FeatureStrategiesReadModel } from '../features/feature-toggle/feature-strategies-read-model.js';
import { FeatureLifecycleReadModel } from '../features/feature-lifecycle/feature-lifecycle-read-model.js';
import { LargestResourcesReadModel } from '../features/metrics/sizes/largest-resources-read-model.js';
import { IntegrationEventsStore } from '../features/integration-events/integration-events-store.js';
import { FeatureCollaboratorsReadModel } from '../features/feature-toggle/feature-collaborators-read-model.js';
import { createProjectReadModel } from '../features/project/createProjectReadModel.js';
import { OnboardingStore } from '../features/onboarding/onboarding-store.js';
import { createOnboardingReadModel } from '../features/onboarding/createOnboardingReadModel.js';
import { UserUnsubscribeStore } from '../features/user-subscriptions/user-unsubscribe-store.js';
import { UserSubscriptionsReadModel } from '../features/user-subscriptions/user-subscriptions-read-model.js';
import { UniqueConnectionStore } from '../features/unique-connection/unique-connection-store.js';
import { UniqueConnectionReadModel } from '../features/unique-connection/unique-connection-read-model.js';
import { FeatureLinkStore } from '../features/feature-links/feature-link-store.js';
import { UnknownFlagsStore } from '../features/metrics/unknown-flags/unknown-flags-store.js';
import { FeatureLinksReadModel } from '../features/feature-links/feature-links-read-model.js';
import { UserUpdatesReadModel } from '../features/users/user-updates-read-model.js';
import { EdgeTokenStore } from '../features/edgetokens/edge-token-store.js';
import { ReleasePlanMilestoneStrategyStore } from '../features/release-plans/release-plan-milestone-strategy-store.js';

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
            config.clientApplicationSeenAtUpdateIntervalSeconds,
        ),
        clientInstanceStore: new ClientInstanceStore(db, eventBus, getLogger),
        clientMetricsStoreV2: new ClientMetricsStoreV2(
            db,
            eventBus,
            getLogger,
            config.flagResolver,
        ),
        contextFieldStore: new ContextFieldStore(
            db,
            getLogger,
            config.flagResolver,
        ),
        settingStore: new SettingStore(db, getLogger),
        userStore: new UserStore(db, getLogger),
        userUpdatesReadModel: new UserUpdatesReadModel(db, getLogger),
        accountStore: new AccountStore(db, getLogger),
        projectStore: new ProjectStore(db, eventBus, config),
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
            config,
        ),
        environmentStore: new EnvironmentStore(db, eventBus, config),
        featureTagStore: new FeatureTagStore(db, eventBus, getLogger),
        featureEnvironmentStore: new FeatureEnvironmentStore(
            db,
            eventBus,
            config,
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
        featureLifecycleStore: new FeatureLifecycleStore(db, eventBus),
        featureStrategiesReadModel: new FeatureStrategiesReadModel(db),
        onboardingReadModel: createOnboardingReadModel(db),
        onboardingStore: new OnboardingStore(db),
        featureLifecycleReadModel: new FeatureLifecycleReadModel(db),
        largestResourcesReadModel: new LargestResourcesReadModel(db),
        integrationEventsStore: new IntegrationEventsStore(db, { eventBus }),
        featureCollaboratorsReadModel: new FeatureCollaboratorsReadModel(db),
        projectReadModel: createProjectReadModel(
            db,
            eventBus,
            config.flagResolver,
        ),
        userUnsubscribeStore: new UserUnsubscribeStore(db),
        userSubscriptionsReadModel: new UserSubscriptionsReadModel(db),
        uniqueConnectionStore: new UniqueConnectionStore(db),
        uniqueConnectionReadModel: new UniqueConnectionReadModel(
            new UniqueConnectionStore(db),
        ),
        releasePlanStore: new ReleasePlanStore(db, config),
        releasePlanTemplateStore: new ReleasePlanTemplateStore(db, config),
        releasePlanMilestoneStore: new ReleasePlanMilestoneStore(db, config),
        releasePlanMilestoneStrategyStore:
            new ReleasePlanMilestoneStrategyStore(db, config),
        featureLinkStore: new FeatureLinkStore(db, config),
        unknownFlagsStore: new UnknownFlagsStore(db, getLogger),
        featureLinkReadModel: new FeatureLinksReadModel(db, eventBus),
        edgeTokenStore: new EdgeTokenStore(db, eventBus, config),
    };
};
