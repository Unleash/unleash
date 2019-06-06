'use strict';

const { createDb } = require('./db-pool');
const EventStore = require('./event-store');
const FeatureToggleStore = require('./feature-toggle-store');
const StrategyStore = require('./strategy-store');
const ClientInstanceStore = require('./client-instance-store');
const ClientMetricsDb = require('./client-metrics-db');
const ClientMetricsStore = require('./client-metrics-store');
const ClientApplicationsStore = require('./client-applications-store');

module.exports.createStores = config => {
    const getLogger = config.getLogger;
    const db = createDb();
    const eventStore = new EventStore(db, getLogger);
    const clientMetricsDb = new ClientMetricsDb(db, getLogger);

    return {
        db,
        eventStore,
        featureToggleStore: new FeatureToggleStore(db, eventStore, getLogger),
        strategyStore: new StrategyStore(db, eventStore, getLogger),
        clientApplicationsStore: new ClientApplicationsStore(db, getLogger),
        clientInstanceStore: new ClientInstanceStore(db, getLogger),
        clientMetricsStore: new ClientMetricsStore(clientMetricsDb, getLogger),
    };
};
