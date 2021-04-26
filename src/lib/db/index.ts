'use strict';

// eslint-disable-next-line
import EventEmitter from "events";
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';

import { createDb } from './db-pool';
import EventStore from './event-store';
import FeatureToggleStore from './feature-toggle-store';
import FeatureTypeStore from './feature-type-store';
import StrategyStore from './strategy-store';
import ClientInstanceStore from './client-instance-store';
import ClientMetricsDb from './client-metrics-db';
import ClientMetricsStore from './client-metrics-store';
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

export const createStores = (
    config: IUnleashConfig,
    eventBus: EventEmitter,
): IUnleashStores => {
    const { getLogger } = config;
    const db = createDb(config);
    const eventStore = new EventStore(db, getLogger);
    const clientMetricsDb = new ClientMetricsDb(db, getLogger);

    return {
        db,
        eventStore,
        featureToggleStore: new FeatureToggleStore(db, eventBus, getLogger),
        featureTypeStore: new FeatureTypeStore(db, getLogger),
        strategyStore: new StrategyStore(db, getLogger),
        clientApplicationsStore: new ClientApplicationsStore(db, eventBus),
        clientInstanceStore: new ClientInstanceStore(db, eventBus, getLogger),
        clientMetricsStore: new ClientMetricsStore(
            clientMetricsDb,
            eventBus,
            getLogger,
        ),
        contextFieldStore: new ContextFieldStore(db, getLogger),
        settingStore: new SettingStore(db, getLogger),
        userStore: new UserStore(db, getLogger),
        projectStore: new ProjectStore(db, getLogger),
        tagStore: new TagStore(db, eventBus, getLogger),
        tagTypeStore: new TagTypeStore(db, eventBus, getLogger),
        addonStore: new AddonStore(db, eventBus, getLogger),
        accessStore: new AccessStore(db, eventBus, getLogger),
        apiTokenStore: new ApiTokenStore(db, eventBus, getLogger),
        resetTokenStore: new ResetTokenStore(db, eventBus, getLogger),
        sessionStore: new SessionStore(db, eventBus, getLogger),
    };
};

module.exports = {
    createStores,
};
