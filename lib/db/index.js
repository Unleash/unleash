'use strict';

const { createDb } = require('./db-pool');
const EventStore = require('./event-store');
const FeatureToggleStore = require('./feature-toggle-store');
const FeatureTypeStore = require('./feature-type-store');
const StrategyStore = require('./strategy-store');
const ClientInstanceStore = require('./client-instance-store');
const ClientMetricsDb = require('./client-metrics-db');
const ClientMetricsStore = require('./client-metrics-store');
const ClientApplicationsStore = require('./client-applications-store');
const ContextFieldStore = require('./context-field-store');
const SettingStore = require('./setting-store');
const UserStore = require('./user-store');

module.exports.createStores = (config, eventBus) => {
    const { getLogger } = config;
    const db = createDb(config);
    const eventStore = new EventStore(db, getLogger);
    const clientMetricsDb = new ClientMetricsDb(db, getLogger);

    return {
        db,
        eventStore,
        featureToggleStore: new FeatureToggleStore(
            db,
            eventStore,
            eventBus,
            getLogger,
        ),
        featureTypeStore: new FeatureTypeStore(db, getLogger),
        strategyStore: new StrategyStore(db, eventStore, getLogger),
        clientApplicationsStore: new ClientApplicationsStore(
            db,
            eventBus,
            getLogger,
        ),
        clientInstanceStore: new ClientInstanceStore(db, eventBus, getLogger),
        clientMetricsStore: new ClientMetricsStore(
            clientMetricsDb,
            eventBus,
            getLogger,
        ),
        contextFieldStore: new ContextFieldStore(
            db,
            config.customContextFields,
            eventStore,
            getLogger,
        ),
        settingStore: new SettingStore(db, getLogger),
        userStore: new UserStore(db, getLogger),
    };
};
