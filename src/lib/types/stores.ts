import { IProjectStore } from '../features/project/project-store-type.js';
import { IEventStore } from './stores/event-store.js';
import { IFeatureTypeStore } from './stores/feature-type-store.js';
import { IStrategyStore } from './stores/strategy-store.js';
import { IClientApplicationsStore } from './stores/client-applications-store.js';
import { IClientInstanceStore } from './stores/client-instance-store.js';
import { IFeatureToggleStore } from '../features/feature-toggle/types/feature-toggle-store-type.js';
import { IContextFieldStore } from '../features/context/context-field-store-type.js';
import { ISettingStore } from './stores/settings-store.js';
import { ISessionStore } from './stores/session-store.js';
import { ITagStore } from './stores/tag-store.js';
import { ITagTypeStore } from '../features/tag-type/tag-type-store-type.js';
import { IFeatureTagStore } from './stores/feature-tag-store.js';
import { IUserStore } from './stores/user-store.js';
import { IAddonStore } from './stores/addon-store.js';
import { IAccessStore } from './stores/access-store.js';
import { IApiTokenStore } from './stores/api-token-store.js';
import { IResetTokenStore } from './stores/reset-token-store.js';
import { IUserFeedbackStore } from './stores/user-feedback-store.js';
import { IFeatureEnvironmentStore } from './stores/feature-environment-store.js';
import { IFeatureStrategiesStore } from '../features/feature-toggle/types/feature-toggle-strategies-store-type.js';
import { IEnvironmentStore } from '../features/project-environments/environment-store-type.js';
import { IFeatureToggleClientStore } from '../features/client-feature-toggles/types/client-feature-toggle-store-type.js';
import { IClientMetricsStoreV2 } from '../features/metrics/client-metrics/client-metrics-store-v2-type.js';
import { IUserSplashStore } from './stores/user-splash-store.js';
import { IRoleStore } from './stores/role-store.js';
import { ISegmentStore } from '../features/segment/segment-store-type.js';
import { IGroupStore } from './stores/group-store.js';
import { IPatStore } from './stores/pat-store.js';
import { IPublicSignupTokenStore } from './stores/public-signup-token-store.js';
import { IFavoriteFeaturesStore } from './stores/favorite-features.js';
import { IFavoriteProjectsStore } from './stores/favorite-projects.js';
import { IAccountStore } from './stores/account-store.js';
import type { IProjectStatsStore } from './stores/project-stats-store-type.js';
import { IImportTogglesStore } from '../features/export-import-toggles/import-toggles-store-type.js';
import { IPrivateProjectStore } from '../features/private-project/privateProjectStoreType.js';
import { IDependentFeaturesStore } from '../features/dependent-features/dependent-features-store-type.js';
import { ILastSeenStore } from '../features/metrics/last-seen/types/last-seen-store-type.js';
import { IFeatureSearchStore } from '../features/feature-search/feature-search-store-type.js';
import type { IInactiveUsersStore } from '../users/inactive/types/inactive-users-store-type.js';
import { ITrafficDataUsageStore } from '../features/traffic-data-usage/traffic-data-usage-store-type.js';
import { ISegmentReadModel } from '../features/segment/segment-read-model-type.js';
import { IProjectOwnersReadModel } from '../features/project/project-owners-read-model.type.js';
import { IFeatureLifecycleStore } from '../features/feature-lifecycle/feature-lifecycle-store-type.js';
import { IProjectFlagCreatorsReadModel } from '../features/project/project-flag-creators-read-model.type.js';
import { IFeatureStrategiesReadModel } from '../features/feature-toggle/types/feature-strategies-read-model-type.js';
import { IFeatureLifecycleReadModel } from '../features/feature-lifecycle/feature-lifecycle-read-model-type.js';
import { ILargestResourcesReadModel } from '../features/metrics/sizes/largest-resources-read-model-type.js';
import type { IntegrationEventsStore } from '../features/integration-events/integration-events-store.js';
import { IFeatureCollaboratorsReadModel } from '../features/feature-toggle/types/feature-collaborators-read-model-type.js';
import type { IProjectReadModel } from '../features/project/project-read-model-type.js';
import { IOnboardingReadModel } from '../features/onboarding/onboarding-read-model-type.js';
import { IOnboardingStore } from '../features/onboarding/onboarding-store-type.js';
import type { IUserUnsubscribeStore } from '../features/user-subscriptions/user-unsubscribe-store-type.js';
import type { IUserSubscriptionsReadModel } from '../features/user-subscriptions/user-subscriptions-read-model-type.js';
import { IUniqueConnectionStore } from '../features/unique-connection/unique-connection-store-type.js';
import { IUniqueConnectionReadModel } from '../features/unique-connection/unique-connection-read-model-type.js';
import { ReleasePlanStore } from '../features/release-plans/release-plan-store.js';
import { ReleasePlanTemplateStore } from '../features/release-plans/release-plan-template-store.js';
import { ReleasePlanMilestoneStore } from '../features/release-plans/release-plan-milestone-store.js';
import { ReleasePlanMilestoneStrategyStore } from '../features/release-plans/release-plan-milestone-strategy-store.js';

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
    onboardingStore: IOnboardingStore;
    userUnsubscribeStore: IUserUnsubscribeStore;
    userSubscriptionsReadModel: IUserSubscriptionsReadModel;
    uniqueConnectionStore: IUniqueConnectionStore;
    uniqueConnectionReadModel: IUniqueConnectionReadModel;
    releasePlanStore: ReleasePlanStore;
    releasePlanTemplateStore: ReleasePlanTemplateStore;
    releasePlanMilestoneStore: ReleasePlanMilestoneStore;
    releasePlanMilestoneStrategyStore: ReleasePlanMilestoneStrategyStore;
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
    IOnboardingStore,
    type IUserSubscriptionsReadModel,
    IUniqueConnectionStore,
    IUniqueConnectionReadModel,
    ReleasePlanStore,
    ReleasePlanTemplateStore,
    ReleasePlanMilestoneStore,
    ReleasePlanMilestoneStrategyStore,
};
