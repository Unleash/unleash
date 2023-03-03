import { IProjectStore } from './stores/project-store';
import { IEventStore } from './stores/event-store';
import { IFeatureTypeStore } from './stores/feature-type-store';
import { IStrategyStore } from './stores/strategy-store';
import { IClientApplicationsStore } from './stores/client-applications-store';
import { IClientInstanceStore } from './stores/client-instance-store';
import { IFeatureToggleStore } from './stores/feature-toggle-store';
import { IContextFieldStore } from './stores/context-field-store';
import { ISettingStore } from './stores/settings-store';
import { ISessionStore } from './stores/session-store';
import { ITagStore } from './stores/tag-store';
import { ITagTypeStore } from './stores/tag-type-store';
import { IFeatureTagStore } from './stores/feature-tag-store';
import { IUserStore } from './stores/user-store';
import { IAddonStore } from './stores/addon-store';
import { IAccessStore } from './stores/access-store';
import { IApiTokenStore } from './stores/api-token-store';
import { IResetTokenStore } from './stores/reset-token-store';
import { IUserFeedbackStore } from './stores/user-feedback-store';
import { IFeatureEnvironmentStore } from './stores/feature-environment-store';
import { IFeatureStrategiesStore } from './stores/feature-strategies-store';
import { IEnvironmentStore } from './stores/environment-store';
import { IFeatureToggleClientStore } from './stores/feature-toggle-client-store';
import { IClientMetricsStoreV2 } from './stores/client-metrics-store-v2';
import { IUserSplashStore } from './stores/user-splash-store';
import { IRoleStore } from './stores/role-store';
import { ISegmentStore } from './stores/segment-store';
import { IGroupStore } from './stores/group-store';
import { IPatStore } from './stores/pat-store';
import { IPublicSignupTokenStore } from './stores/public-signup-token-store';
import { IFavoriteFeaturesStore } from './stores/favorite-features';
import { IFavoriteProjectsStore } from './stores/favorite-projects';
import { IAccountStore } from './stores/account-store';
import { IProjectStatsStore } from './stores/project-stats-store-type';
import { IImportTogglesStore } from '../features/export-import-toggles/import-toggles-store-type';

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
    featureToggleClientStore: IFeatureToggleClientStore;
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
};
