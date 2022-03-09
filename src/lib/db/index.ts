import { Knex } from 'knex';
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';

import EventStore from './event-store';
import FeatureToggleStore from './feature-toggle-store';
import FeatureTypeStore from './feature-type-store';
import StrategyStore from './strategy-store';
import ClientInstanceStore from './client-instance-store';
import ClientApplicationsStore from './client-applications-store';
import ContextFieldStore from './context-field-store';
import SettingStore from './setting-store';
import UserStore from './user-store';
import ProjectStore from './project-store';
import TagStore from './tag-store';
import TagTypeStore from './tag-type-store';
import AddonStore from './addon-store';
import { ApiTokenStore } from './api-token-store';
import SessionStore from './session-store';
import { AccessStore } from './access-store';
import { ResetTokenStore } from './reset-token-store';
import UserFeedbackStore from './user-feedback-store';
import FeatureStrategyStore from './feature-strategy-store';
import FeatureToggleClientStore from './feature-toggle-client-store';
import EnvironmentStore from './environment-store';
import FeatureTagStore from './feature-tag-store';
import { FeatureEnvironmentStore } from './feature-environment-store';
import { ClientMetricsStoreV2 } from './client-metrics-store-v2';
import UserSplashStore from './user-splash-store';
import RoleStore from './role-store';
import SegmentStore from './segment-store';

export const createStores = (
    config: IUnleashConfig,
    db: Knex,
): IUnleashStores => {
    const { getLogger, eventBus } = config;
    const eventStore = new EventStore(db, getLogger);

    return {
        eventStore,
        featureToggleStore: new FeatureToggleStore(db, eventBus, getLogger),
        featureTypeStore: new FeatureTypeStore(db, getLogger),
        strategyStore: new StrategyStore(db, getLogger),
        clientApplicationsStore: new ClientApplicationsStore(
            db,
            eventBus,
            getLogger,
        ),
        clientInstanceStore: new ClientInstanceStore(db, eventBus, getLogger),
        clientMetricsStoreV2: new ClientMetricsStoreV2(db, getLogger),
        contextFieldStore: new ContextFieldStore(db, getLogger),
        settingStore: new SettingStore(db, getLogger),
        userStore: new UserStore(db, getLogger),
        projectStore: new ProjectStore(db, eventBus, getLogger),
        tagStore: new TagStore(db, eventBus, getLogger),
        tagTypeStore: new TagTypeStore(db, eventBus, getLogger),
        addonStore: new AddonStore(db, eventBus, getLogger),
        accessStore: new AccessStore(db, eventBus, getLogger),
        apiTokenStore: new ApiTokenStore(db, eventBus, getLogger),
        resetTokenStore: new ResetTokenStore(db, eventBus, getLogger),
        sessionStore: new SessionStore(db, eventBus, getLogger),
        userFeedbackStore: new UserFeedbackStore(db, eventBus, getLogger),
        featureStrategiesStore: new FeatureStrategyStore(
            db,
            eventBus,
            getLogger,
        ),
        featureToggleClientStore: new FeatureToggleClientStore(
            db,
            eventBus,
            getLogger,
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
        segmentStore: new SegmentStore(db, eventBus, getLogger),
    };
};

module.exports = {
    createStores,
};
