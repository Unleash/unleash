import FakeFeatureStrategiesStore from '../../lib/features/feature-toggle/fakes/fake-feature-strategies-store.js';
import FakeClientInstanceStore from './fake-client-instance-store.js';
import FakeClientApplicationsStore from './fake-client-applications-store.js';
import FakeFeatureToggleStore from '../../lib/features/feature-toggle/fakes/fake-feature-toggle-store.js';
import FakeTagStore from './fake-tag-store.js';
import FakeTagTypeStore from '../../lib/features/tag-type/fake-tag-type-store.js';
import FakeEventStore from './fake-event-store.js';
import FakeContextFieldStore from '../../lib/features/context/fake-context-field-store.js';
import FakeSettingStore from './fake-setting-store.js';
import FakeAddonStore from './fake-addon-store.js';
import FakeProjectStore from './fake-project-store.js';
import FakeUserStore from './fake-user-store.js';
import FakeAccessStore from './fake-access-store.js';
import FakeUserFeedbackStore from './fake-user-feedback-store.js';
import FakeFeatureTagStore from './fake-feature-tag-store.js';
import FakeEnvironmentStore from '../../lib/features/project-environments/fake-environment-store.js';
import FakeStrategiesStore from './fake-strategies-store.js';
import type {
    IImportTogglesStore,
    IntegrationEventsStore,
    IPrivateProjectStore,
    IUnleashStores,
    ReleasePlanMilestoneStore,
    ReleasePlanStore,
    ReleasePlanTemplateStore,
} from '../../lib/types/index.js';
import FakeSessionStore from './fake-session-store.js';
import FakeFeatureEnvironmentStore from './fake-feature-environment-store.js';
import FakeApiTokenStore from './fake-api-token-store.js';
import FakeFeatureTypeStore from './fake-feature-type-store.js';
import FakeResetTokenStore from './fake-reset-token-store.js';
import FakeClientFeatureToggleStore from '../../lib/features/client-feature-toggles/fakes/fake-client-feature-toggle-store.js';
import FakeClientMetricsStoreV2 from '../../lib/features/metrics/client-metrics/fake-client-metrics-store-v2.js';
import FakeUserSplashStore from './fake-user-splash-store.js';
import FakeRoleStore from './fake-role-store.js';
import FakeSegmentStore from './fake-segment-store.js';
import FakeGroupStore from './fake-group-store.js';
import FakePatStore from './fake-pat-store.js';
import FakePublicSignupStore from './fake-public-signup-store.js';
import FakeFavoriteFeaturesStore from './fake-favorite-features-store.js';
import FakeFavoriteProjectsStore from './fake-favorite-projects-store.js';
import { FakeAccountStore } from './fake-account-store.js';
import FakeProjectStatsStore from './fake-project-stats-store.js';
import { FakeDependentFeaturesStore } from '../../lib/features/dependent-features/fake-dependent-features-store.js';
import { FakeLastSeenStore } from '../../lib/features/metrics/last-seen/fake-last-seen-store.js';
import FakeFeatureSearchStore from '../../lib/features/feature-search/fake-feature-search-store.js';
import { FakeInactiveUsersStore } from '../../lib/users/inactive/fakes/fake-inactive-users-store.js';
import { FakeTrafficDataUsageStore } from '../../lib/features/traffic-data-usage/fake-traffic-data-usage-store.js';
import { FakeSegmentReadModel } from '../../lib/features/segment/fake-segment-read-model.js';
import { FakeProjectOwnersReadModel } from '../../lib/features/project/fake-project-owners-read-model.js';
import { FakeFeatureLifecycleStore } from '../../lib/features/feature-lifecycle/fake-feature-lifecycle-store.js';
import { FakeProjectFlagCreatorsReadModel } from '../../lib/features/project/fake-project-flag-creators-read-model.js';
import { FakeFeatureStrategiesReadModel } from '../../lib/features/feature-toggle/fake-feature-strategies-read-model.js';
import { FakeFeatureLifecycleReadModel } from '../../lib/features/feature-lifecycle/fake-feature-lifecycle-read-model.js';
import { FakeLargestResourcesReadModel } from '../../lib/features/metrics/sizes/fake-largest-resources-read-model.js';
import { FakeFeatureCollaboratorsReadModel } from '../../lib/features/feature-toggle/fake-feature-collaborators-read-model.js';
import { createFakeProjectReadModel } from '../../lib/features/project/createProjectReadModel.js';
import { FakeOnboardingStore } from '../../lib/features/onboarding/fake-onboarding-store.js';
import { createFakeOnboardingReadModel } from '../../lib/features/onboarding/createOnboardingReadModel.js';
import { FakeUserUnsubscribeStore } from '../../lib/features/user-subscriptions/fake-user-unsubscribe-store.js';
import { FakeUserSubscriptionsReadModel } from '../../lib/features/user-subscriptions/fake-user-subscriptions-read-model.js';
import { FakeUniqueConnectionStore } from '../../lib/features/unique-connection/fake-unique-connection-store.js';
import { UniqueConnectionReadModel } from '../../lib/features/unique-connection/unique-connection-read-model.js';
import FakeFeatureLinkStore from '../../lib/features/feature-links/fake-feature-link-store.js';
import { FakeFeatureLinksReadModel } from '../../lib/features/feature-links/fake-feature-links-read-model.js';
import { FakeUnknownFlagsStore } from '../../lib/features/metrics/unknown-flags/fake-unknown-flags-store.js';
import { FakeReleasePlanMilestoneStrategyStore } from './fake-release-plan-milestone-strategy-store.js';
import type { UserUpdatesReadModel } from '../../lib/features/users/user-updates-read-model.js';
import { FakeEdgeTokenStore } from '../../lib/features/edgetokens/fake-edge-token-store.js';

const db = {
    select: () => ({
        from: () => Promise.resolve(),
    }),
};

const createStores: () => IUnleashStores = () => {
    const uniqueConnectionStore = new FakeUniqueConnectionStore();
    const unknownFlagsStore = new FakeUnknownFlagsStore();

    return {
        db,
        clientApplicationsStore: new FakeClientApplicationsStore(),
        clientMetricsStoreV2: new FakeClientMetricsStoreV2(),
        clientInstanceStore: new FakeClientInstanceStore(),
        featureToggleStore: new FakeFeatureToggleStore(),
        clientFeatureToggleStore: new FakeClientFeatureToggleStore(),
        tagStore: new FakeTagStore(),
        tagTypeStore: new FakeTagTypeStore(),
        eventStore: new FakeEventStore(),
        strategyStore: new FakeStrategiesStore(),
        contextFieldStore: new FakeContextFieldStore(),
        settingStore: new FakeSettingStore(),
        addonStore: new FakeAddonStore(),
        projectStore: new FakeProjectStore(),
        userStore: new FakeUserStore(),
        userUpdatesReadModel: {} as UserUpdatesReadModel,
        accessStore: new FakeAccessStore(),
        accountStore: new FakeAccountStore(),
        userFeedbackStore: new FakeUserFeedbackStore(),
        featureStrategiesStore: new FakeFeatureStrategiesStore(),
        featureTagStore: new FakeFeatureTagStore(),
        environmentStore: new FakeEnvironmentStore(),
        featureEnvironmentStore: new FakeFeatureEnvironmentStore(),
        apiTokenStore: new FakeApiTokenStore(),
        featureTypeStore: new FakeFeatureTypeStore(),
        resetTokenStore: new FakeResetTokenStore(),
        sessionStore: new FakeSessionStore(),
        userSplashStore: new FakeUserSplashStore(),
        roleStore: new FakeRoleStore(),
        segmentStore: new FakeSegmentStore(),
        groupStore: new FakeGroupStore(),
        patStore: new FakePatStore(),
        publicSignupTokenStore: new FakePublicSignupStore(),
        favoriteFeaturesStore: new FakeFavoriteFeaturesStore(),
        favoriteProjectsStore: new FakeFavoriteProjectsStore(),
        projectStatsStore: new FakeProjectStatsStore(),
        importTogglesStore: {} as IImportTogglesStore,
        privateProjectStore: {} as IPrivateProjectStore,
        dependentFeaturesStore: new FakeDependentFeaturesStore(),
        lastSeenStore: new FakeLastSeenStore(),
        featureSearchStore: new FakeFeatureSearchStore(),
        inactiveUsersStore: new FakeInactiveUsersStore(),
        trafficDataUsageStore: new FakeTrafficDataUsageStore(),
        segmentReadModel: new FakeSegmentReadModel(),
        projectOwnersReadModel: new FakeProjectOwnersReadModel(),
        projectFlagCreatorsReadModel: new FakeProjectFlagCreatorsReadModel(),
        featureLifecycleStore: new FakeFeatureLifecycleStore(),
        featureStrategiesReadModel: new FakeFeatureStrategiesReadModel(),
        featureLifecycleReadModel: new FakeFeatureLifecycleReadModel(),
        onboardingReadModel: createFakeOnboardingReadModel(),
        largestResourcesReadModel: new FakeLargestResourcesReadModel(),
        integrationEventsStore: {} as IntegrationEventsStore,
        featureCollaboratorsReadModel: new FakeFeatureCollaboratorsReadModel(),
        projectReadModel: createFakeProjectReadModel(),
        onboardingStore: new FakeOnboardingStore(),
        userUnsubscribeStore: new FakeUserUnsubscribeStore(),
        userSubscriptionsReadModel: new FakeUserSubscriptionsReadModel(),
        uniqueConnectionStore,
        uniqueConnectionReadModel: new UniqueConnectionReadModel(
            uniqueConnectionStore,
        ),
        releasePlanStore: {
            count: () => Promise.resolve(0),
        } as ReleasePlanStore,
        releasePlanMilestoneStore: {
            count: () => Promise.resolve(0),
        } as ReleasePlanMilestoneStore,
        releasePlanTemplateStore: {
            count: () => Promise.resolve(0),
        } as ReleasePlanTemplateStore,
        releasePlanMilestoneStrategyStore:
            new FakeReleasePlanMilestoneStrategyStore(),
        featureLinkStore: new FakeFeatureLinkStore(),
        unknownFlagsStore,
        featureLinkReadModel: new FakeFeatureLinksReadModel(),
        edgeTokenStore: new FakeEdgeTokenStore(),
    };
};

export default createStores;
