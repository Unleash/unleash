'use strict';

const EventStore = require('./event-store');
const FeatureToggleStore = require('./feature-toggle-store');
const StrategyStore = require('./strategy-store');
const clientInstancesDbCreator = require('./client-instances');
const ClientMetricsStore = require('./client-metrics-store');
const clientStrategiesDbCreator = require('./client-strategies');

module.exports = (db) => {
    const eventStore = new EventStore(db);

    return {
        eventStore,
        featureToggleStore: new FeatureToggleStore(db, eventStore),
        strategyStore: new StrategyStore(db, eventStore),
        clientInstancesDb: clientInstancesDbCreator(db),
        clientMetricsStore: new ClientMetricsStore(db),
        clientStrategiesDb: clientStrategiesDbCreator(db),
    };
};
