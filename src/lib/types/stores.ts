import type { IProjectStore } from '../features/project/project-store-type.js';
import type { IEventStore } from './stores/event-store.js';
import type { IFeatureTypeStore } from './stores/feature-type-store.js';
import type { IStrategyStore } from './stores/strategy-store.js';
import type { IClientApplicationsStore } from './stores/client-applications-store.js';
import type { IClientInstanceStore } from './stores/client-instance-store.js';
import type { IFeatureToggleStore } from '../features/feature-toggle/types/feature-toggle-store-type.js';
import type { IContextFieldStore } from '../features/context/context-field-store-type.js';
import type { ISettingStore } from './stores/settings-store.js';
import type { ISessionStore } from './stores/session-store.js';
import type { ITagStore } from './stores/tag-store.js';
import type { ITagTypeStore } from '../features/tag-type/tag-type-store-type.js';
import type { IFeatureTagStore } from './stores/feature-tag-store.js';
import type { IUserStore } from './stores/user-store.js';
import type { IAddonStore } from './stores/addon-store.js';
import type { IAccessStore } from './stores/access-store.js';
import type { IApiTokenStore } from './stores/api-token-store.js';
import type { IResetTokenStore } from './stores/reset-token-store.js';
import type { IUserFeedbackStore } from './stores/user-feedback-store.js';
import type { IFeatureEnvironmentStore } from './stores/feature-environment-store.js';
import type { IFeatureStrategiesStore } from '../features/feature-toggle/types/feature-toggle-strategies-store-type.js';
import type { IEnvironmentStore } from '../features/project-environments/environment-store-type.js';
import type { IFeatureToggleClientStore } from '../features/client-feature-toggles/types/client-feature-toggle-store-type.js';
import type { IClientMetricsStoreV2 } from '../features/metrics/client-metrics/client-metrics-store-v2-type.js';
import type { IUserSplashStore } from './stores/user-splash-store.js';
import type { IRoleStore } from './stores/role-store.js';
import type { ISegmentStore } from '../features/segment/segment-store-type.js';
import type { IGroupStore } from './stores/group-store.js';
import type { IPatStore } from '../features/pat/pat-store-type.js';
import type { IPublicSignupTokenStore } from './stores/public-signup-token-store.js';
import type { IFavoriteFeaturesStore } from './stores/favorite-features.js';
import type { IFavoriteProjectsStore } from './stores/favorite-projects.js';
import type { IAccountStore } from './stores/account-store.js';
import type { IProjectStatsStore } from './stores/project-stats-store-type.js';
import type { IImportTogglesStore } from '../features/export-import-toggles/import-toggles-store-type.js';
import type { IPrivateProjectStore } from '../features/private-project/privateProjectStoreType.js';
import type { IDependentFeaturesStore } from '../features/dependent-features/dependent-features-store-type.js';
import type { ILastSeenStore } from '../features/metrics/last-seen/types/last-seen-store-type.js';
import type { IFeatureSearchStore } from '../features/feature-search/feature-search-store-type.js';
import type { IInactiveUsersStore } from '../users/inactive/types/inactive-users-store-type.js';
import type { ITrafficDataUsageStore } from '../features/traffic-data-usage/traffic-data-usage-store-type.js';
import type { ISegmentReadModel } from '../features/segment/segment-read-model-type.js';
import type { IProjectOwnersReadModel } from '../features/project/project-owners-read-model.type.js';
import type { IFeatureLifecycleStore } from '../features/feature-lifecycle/feature-lifecycle-store-type.js';
import type { IProjectFlagCreatorsReadModel } from '../features/project/project-flag-creators-read-model.type.js';
import type { IFeatureStrategiesReadModel } from '../features/feature-toggle/types/feature-strategies-read-model-type.js';
import type { IFeatureLifecycleReadModel } from '../features/feature-lifecycle/feature-lifecycle-read-model-type.js';
import type { ILargestResourcesReadModel } from '../features/metrics/sizes/largest-resources-read-model-type.js';
import type { IntegrationEventsStore } from '../features/integration-events/integration-events-store.js';
import type { IFeatureCollaboratorsReadModel } from '../features/feature-toggle/types/feature-collaborators-read-model-type.js';
import type { IProjectReadModel } from '../features/project/project-read-model-type.js';
import type { IOnboardingReadModel } from '../features/onboarding/onboarding-read-model-type.js';
import type { IOnboardingStore } from '../features/onboarding/onboarding-store-type.js';
import type { IUserUnsubscribeStore } from '../features/user-subscriptions/user-unsubscribe-store-type.js';
import type { IUserSubscriptionsReadModel } from '../features/user-subscriptions/user-subscriptions-read-model-type.js';
import type { IUniqueConnectionStore } from '../features/unique-connection/unique-connection-store-type.js';
import type { IUniqueConnectionReadModel } from '../features/unique-connection/unique-connection-read-model-type.js';
import { ReleasePlanStore } from '../features/release-plans/release-plan-store.js';
import { ReleasePlanTemplateStore } from '../features/release-plans/release-plan-template-store.js';
import { ReleasePlanMilestoneStore } from '../features/release-plans/release-plan-milestone-store.js';
import { ReleasePlanMilestoneStrategyStore } from '../features/release-plans/release-plan-milestone-strategy-store.js';
import type { IFeatureLinkStore } from '../features/feature-links/feature-link-store-type.js';
import type { IUnknownFlagsStore } from '../features/metrics/unknown-flags/unknown-flags-store.js';
import type { IFeatureLinksReadModel } from '../features/feature-links/feature-links-read-model-type.js';
import type { UserUpdatesReadModel } from '../features/users/user-updates-read-model.js';
import type { IEdgeTokenStore } from './stores/edge-store.js';

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
    userUpdatesReadModel: UserUpdatesReadModel;
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
    onboardingStore: IOnboardingStore;
    userUnsubscribeStore: IUserUnsubscribeStore;
    userSubscriptionsReadModel: IUserSubscriptionsReadModel;
    uniqueConnectionStore: IUniqueConnectionStore;
    uniqueConnectionReadModel: IUniqueConnectionReadModel;
    releasePlanStore: ReleasePlanStore;
    releasePlanTemplateStore: ReleasePlanTemplateStore;
    releasePlanMilestoneStore: ReleasePlanMilestoneStore;
    releasePlanMilestoneStrategyStore: ReleasePlanMilestoneStrategyStore;
    featureLinkStore: IFeatureLinkStore;
    unknownFlagsStore: IUnknownFlagsStore;
    featureLinkReadModel: IFeatureLinksReadModel;
    edgeTokenStore: IEdgeTokenStore;
}

export {
    type IAccessStore,
    type IAccountStore,
    type IAddonStore,
    type IApiTokenStore,
    type IClientApplicationsStore,
    type IClientInstanceStore,
    type IClientMetricsStoreV2,
    type IContextFieldStore,
    type IEnvironmentStore,
    type IEventStore,
    type IFeatureEnvironmentStore,
    type IFeatureStrategiesStore,
    type IFeatureTagStore,
    type IFeatureToggleClientStore,
    type IFeatureToggleStore,
    type IFeatureTypeStore,
    type IGroupStore,
    type IPatStore,
    type IProjectStore,
    type IPublicSignupTokenStore,
    type IResetTokenStore,
    type IRoleStore,
    type ISegmentStore,
    type ISessionStore,
    type ISettingStore,
    type IStrategyStore,
    type ITagStore,
    type ITagTypeStore,
    type IUserFeedbackStore,
    type IUserSplashStore,
    type IUserStore,
    type IFavoriteFeaturesStore,
    type IFavoriteProjectsStore,
    type IImportTogglesStore,
    type IPrivateProjectStore,
    type IDependentFeaturesStore,
    type ILastSeenStore,
    type IFeatureSearchStore,
    type ITrafficDataUsageStore,
    type ISegmentReadModel,
    type IProjectOwnersReadModel,
    type IFeatureLifecycleStore,
    type IProjectFlagCreatorsReadModel,
    type IFeatureStrategiesReadModel,
    type IFeatureLifecycleReadModel,
    type ILargestResourcesReadModel,
    type IFeatureCollaboratorsReadModel,
    type IOnboardingReadModel,
    type IntegrationEventsStore,
    type IProjectReadModel,
    type IOnboardingStore,
    type IUserSubscriptionsReadModel,
    type IUniqueConnectionStore,
    type IUniqueConnectionReadModel,
    ReleasePlanStore,
    ReleasePlanTemplateStore,
    ReleasePlanMilestoneStore,
    ReleasePlanMilestoneStrategyStore,
    type IFeatureLinkStore,
    type IUnknownFlagsStore,
    type IFeatureLinksReadModel,
    type IEdgeTokenStore,
};
