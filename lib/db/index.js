'use strict';

const { createDb } = require('./db-pool');
const EventStore = require('./event-store');
const FeatureToggleStore = require('./feature-toggle-store');
const StrategyStore = require('./strategy-store');
const ClientInstanceStore = require('./client-instance-store');
const ClientMetricsStore = require('./client-metrics-store');
const ClientStrategyStore = require('./client-strategy-store');

module.exports.createStores = (config) => {
    const db = createDb(config.databaseUri);
    const eventStore = new EventStore(db);

    return {
        db,
        eventStore,
        featureToggleStore: new FeatureToggleStore(db, eventStore),
        strategyStore: new StrategyStore(db, eventStore),
        clientInstanceStore: new ClientInstanceStore(db),
        clientMetricsStore: new ClientMetricsStore(db),
        clientStrategyStore: new ClientStrategyStore(db),
    };
};
