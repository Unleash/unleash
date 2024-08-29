import FakeFeatureStrategiesStore from '../../lib/features/feature-toggle/fakes/fake-feature-strategies-store';
import FakeClientInstanceStore from './fake-client-instance-store';
import FakeClientApplicationsStore from './fake-client-applications-store';
import FakeFeatureToggleStore from '../../lib/features/feature-toggle/fakes/fake-feature-toggle-store';
import FakeTagStore from './fake-tag-store';
import FakeTagTypeStore from '../../lib/features/tag-type/fake-tag-type-store';
import FakeEventStore from './fake-event-store';
import FakeContextFieldStore from './fake-context-field-store';
import FakeSettingStore from './fake-setting-store';
import FakeAddonStore from './fake-addon-store';
import FakeProjectStore from './fake-project-store';
import FakeUserStore from './fake-user-store';
import FakeAccessStore from './fake-access-store';
import FakeUserFeedbackStore from './fake-user-feedback-store';
import FakeFeatureTagStore from './fake-feature-tag-store';
import FakeEnvironmentStore from '../../lib/features/project-environments/fake-environment-store';
import FakeStrategiesStore from './fake-strategies-store';
import type {
    IImportTogglesStore,
    IntegrationEventsStore,
    IPrivateProjectStore,
    IUnleashStores,
} from '../../lib/types';
import FakeSessionStore from './fake-session-store';
import FakeFeatureEnvironmentStore from './fake-feature-environment-store';
import FakeApiTokenStore from './fake-api-token-store';
import FakeFeatureTypeStore from './fake-feature-type-store';
import FakeResetTokenStore from './fake-reset-token-store';
import FakeClientFeatureToggleStore from '../../lib/features/client-feature-toggles/fakes/fake-client-feature-toggle-store';
import FakeClientMetricsStoreV2 from '../../lib/features/metrics/client-metrics/fake-client-metrics-store-v2';
import FakeUserSplashStore from './fake-user-splash-store';
import FakeRoleStore from './fake-role-store';
import FakeSegmentStore from './fake-segment-store';
import FakeGroupStore from './fake-group-store';
import FakePatStore from './fake-pat-store';
import FakePublicSignupStore from './fake-public-signup-store';
import FakeFavoriteFeaturesStore from './fake-favorite-features-store';
import FakeFavoriteProjectsStore from './fake-favorite-projects-store';
import { FakeAccountStore } from './fake-account-store';
import FakeProjectStatsStore from './fake-project-stats-store';
import { FakeDependentFeaturesStore } from '../../lib/features/dependent-features/fake-dependent-features-store';
import { FakeLastSeenStore } from '../../lib/features/metrics/last-seen/fake-last-seen-store';
import FakeFeatureSearchStore from '../../lib/features/feature-search/fake-feature-search-store';
import { FakeInactiveUsersStore } from '../../lib/users/inactive/fakes/fake-inactive-users-store';
import { FakeTrafficDataUsageStore } from '../../lib/features/traffic-data-usage/fake-traffic-data-usage-store';
import { FakeSegmentReadModel } from '../../lib/features/segment/fake-segment-read-model';
import { FakeProjectOwnersReadModel } from '../../lib/features/project/fake-project-owners-read-model';
import { FakeFeatureLifecycleStore } from '../../lib/features/feature-lifecycle/fake-feature-lifecycle-store';
import { FakeProjectFlagCreatorsReadModel } from '../../lib/features/project/fake-project-flag-creators-read-model';
import { FakeFeatureStrategiesReadModel } from '../../lib/features/feature-toggle/fake-feature-strategies-read-model';
import { FakeFeatureLifecycleReadModel } from '../../lib/features/feature-lifecycle/fake-feature-lifecycle-read-model';
import { FakeLargestResourcesReadModel } from '../../lib/features/metrics/sizes/fake-largest-resources-read-model';
import { FakeFeatureCollaboratorsReadModel } from '../../lib/features/feature-toggle/fake-feature-collaborators-read-model';
import { createFakeProjectReadModel } from '../../lib/features/project/createProjectReadModel';
import { FakeOnboardingReadModel } from '../../lib/features/onboarding/fake-onboarding-read-model';

const db = {
    select: () => ({
        from: () => Promise.resolve(),
    }),
};

const createStores: () => IUnleashStores = () => {
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
        onboardingReadModel: new FakeOnboardingReadModel(),
        largestResourcesReadModel: new FakeLargestResourcesReadModel(),
        integrationEventsStore: {} as IntegrationEventsStore,
        featureCollaboratorsReadModel: new FakeFeatureCollaboratorsReadModel(),
        projectReadModel: createFakeProjectReadModel(),
    };
};

export default createStores;
