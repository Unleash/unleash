import { IProjectStore } from '../features/project/project-store-type';
import { IEventStore } from './stores/event-store';
import { IFeatureTypeStore } from './stores/feature-type-store';
import { IStrategyStore } from './stores/strategy-store';
import { IClientApplicationsStore } from './stores/client-applications-store';
import { IClientInstanceStore } from './stores/client-instance-store';
import { IFeatureToggleStore } from '../features/feature-toggle/types/feature-toggle-store-type';
import { IContextFieldStore } from './stores/context-field-store';
import { ISettingStore } from './stores/settings-store';
import { ISessionStore } from './stores/session-store';
import { ITagStore } from './stores/tag-store';
import { ITagTypeStore } from '../features/tag-type/tag-type-store-type';
import { IFeatureTagStore } from './stores/feature-tag-store';
import { IUserStore } from './stores/user-store';
import { IAddonStore } from './stores/addon-store';
import { IAccessStore } from './stores/access-store';
import { IApiTokenStore } from './stores/api-token-store';
import { IResetTokenStore } from './stores/reset-token-store';
import { IUserFeedbackStore } from './stores/user-feedback-store';
import { IFeatureEnvironmentStore } from './stores/feature-environment-store';
import { IFeatureStrategiesStore } from '../features/feature-toggle/types/feature-toggle-strategies-store-type';
import { IEnvironmentStore } from '../features/project-environments/environment-store-type';
import { IFeatureToggleClientStore } from '../features/client-feature-toggles/types/client-feature-toggle-store-type';
import { IClientMetricsStoreV2 } from '../features/metrics/client-metrics/client-metrics-store-v2-type';
import { IUserSplashStore } from './stores/user-splash-store';
import { IRoleStore } from './stores/role-store';
import { ISegmentStore } from '../features/segment/segment-store-type';
import { IGroupStore } from './stores/group-store';
import { IPatStore } from './stores/pat-store';
import { IPublicSignupTokenStore } from './stores/public-signup-token-store';
import { IFavoriteFeaturesStore } from './stores/favorite-features';
import { IFavoriteProjectsStore } from './stores/favorite-projects';
import { IAccountStore } from './stores/account-store';
import type { IProjectStatsStore } from './stores/project-stats-store-type';
import { IImportTogglesStore } from '../features/export-import-toggles/import-toggles-store-type';
import { IPrivateProjectStore } from '../features/private-project/privateProjectStoreType';
import { IDependentFeaturesStore } from '../features/dependent-features/dependent-features-store-type';
import { ILastSeenStore } from '../features/metrics/last-seen/types/last-seen-store-type';
import { IFeatureSearchStore } from '../features/feature-search/feature-search-store-type';
import type { IInactiveUsersStore } from '../users/inactive/types/inactive-users-store-type';
import { ITrafficDataUsageStore } from '../features/traffic-data-usage/traffic-data-usage-store-type';
import { ISegmentReadModel } from '../features/segment/segment-read-model-type';
import { IProjectOwnersReadModel } from '../features/project/project-owners-read-model.type';
import { IFeatureLifecycleStore } from '../features/feature-lifecycle/feature-lifecycle-store-type';
import { IProjectFlagCreatorsReadModel } from '../features/project/project-flag-creators-read-model.type';
import { IFeatureStrategiesReadModel } from '../features/feature-toggle/types/feature-strategies-read-model-type';
import { IFeatureLifecycleReadModel } from '../features/feature-lifecycle/feature-lifecycle-read-model-type';
import { ILargestResourcesReadModel } from '../features/metrics/sizes/largest-resources-read-model-type';
import type { IntegrationEventsStore } from '../features/integration-events/integration-events-store';
import { IFeatureCollaboratorsReadModel } from '../features/feature-toggle/types/feature-collaborators-read-model-type';
import type { IProjectReadModel } from '../features/project/project-read-model-type';
import { IOnboardingReadModel } from '../features/onboarding/onboarding-read-model-type';

export interface IUnleashStores {
    accessStore: IAccessStore;
    accountStore: IAccountStore;
    addonStore: IAddonStore;
    apiTokenStore: IApiTokenStore;
    clientApplicationsStore: IClientApplicationsStore;
    clientInstanceStore: IClientInstanceStore;
    clientMetricsStoreV2: IClientMetricsStoreV2;
    contextFieldStore: IContextFieldStore;
    environmentStore: IEnvironmentStore;
    eventStore: IEventStore;
    featureEnvironmentStore: IFeatureEnvironmentStore;
    featureStrategiesStore: IFeatureStrategiesStore;
    featureTagStore: IFeatureTagStore;
    featureToggleStore: IFeatureToggleStore;
    clientFeatureToggleStore: IFeatureToggleClientStore;
    featureTypeStore: IFeatureTypeStore;
    groupStore: IGroupStore;
    projectStore: IProjectStore;
    resetTokenStore: IResetTokenStore;
    sessionStore: ISessionStore;
    settingStore: ISettingStore;
    strategyStore: IStrategyStore;
    tagStore: ITagStore;
    tagTypeStore: ITagTypeStore;
    userFeedbackStore: IUserFeedbackStore;
    userStore: IUserStore;
    userSplashStore: IUserSplashStore;
    roleStore: IRoleStore;
    segmentStore: ISegmentStore;
    patStore: IPatStore;
    publicSignupTokenStore: IPublicSignupTokenStore;
    favoriteFeaturesStore: IFavoriteFeaturesStore;
    favoriteProjectsStore: IFavoriteProjectsStore;
    projectStatsStore: IProjectStatsStore;
    importTogglesStore: IImportTogglesStore;
    privateProjectStore: IPrivateProjectStore;
    dependentFeaturesStore: IDependentFeaturesStore;
    lastSeenStore: ILastSeenStore;
    featureSearchStore: IFeatureSearchStore;
    inactiveUsersStore: IInactiveUsersStore;
    trafficDataUsageStore: ITrafficDataUsageStore;
    segmentReadModel: ISegmentReadModel;
    projectOwnersReadModel: IProjectOwnersReadModel;
    projectFlagCreatorsReadModel: IProjectFlagCreatorsReadModel;
    featureLifecycleStore: IFeatureLifecycleStore;
    featureStrategiesReadModel: IFeatureStrategiesReadModel;
    featureLifecycleReadModel: IFeatureLifecycleReadModel;
    largestResourcesReadModel: ILargestResourcesReadModel;
    integrationEventsStore: IntegrationEventsStore;
    featureCollaboratorsReadModel: IFeatureCollaboratorsReadModel;
    projectReadModel: IProjectReadModel;
    onboardingReadModel: IOnboardingReadModel;
}

export {
    IAccessStore,
    IAccountStore,
    IAddonStore,
    IApiTokenStore,
    IClientApplicationsStore,
    IClientInstanceStore,
    IClientMetricsStoreV2,
    IContextFieldStore,
    IEnvironmentStore,
    IEventStore,
    IFeatureEnvironmentStore,
    IFeatureStrategiesStore,
    IFeatureTagStore,
    IFeatureToggleClientStore,
    IFeatureToggleStore,
    IFeatureTypeStore,
    IGroupStore,
    IPatStore,
    IProjectStore,
    IPublicSignupTokenStore,
    IResetTokenStore,
    IRoleStore,
    ISegmentStore,
    ISessionStore,
    ISettingStore,
    IStrategyStore,
    ITagStore,
    ITagTypeStore,
    IUserFeedbackStore,
    IUserSplashStore,
    IUserStore,
    IFavoriteFeaturesStore,
    IFavoriteProjectsStore,
    IImportTogglesStore,
    IPrivateProjectStore,
    IDependentFeaturesStore,
    ILastSeenStore,
    IFeatureSearchStore,
    ITrafficDataUsageStore,
    ISegmentReadModel,
    IProjectOwnersReadModel,
    IFeatureLifecycleStore,
    IProjectFlagCreatorsReadModel,
    IFeatureStrategiesReadModel,
    IFeatureLifecycleReadModel,
    ILargestResourcesReadModel,
    IFeatureCollaboratorsReadModel,
    IOnboardingReadModel,
    type IntegrationEventsStore,
    type IProjectReadModel,
};
