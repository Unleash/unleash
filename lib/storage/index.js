'use strict';

const { createDb } = require('./db/db-pool');
const EventStore = require('./event-store');
const FeatureToggleStore = require('./feature-toggle-store');
const StrategyStore = require('./strategy-store');
const ClientInstanceStore = require('./client-instance-store');
const ClientMetricsStore = require('./client-metrics-store');
const ClientMetricsEventStore = require('./client-metrics-event-store');
const ClientApplicationsStore = require('./client-applications-store');

module.exports.createStores = (config, eventBus) => {
    const getLogger = config.getLogger;
    const db = createDb(config);
    const eventStore = new EventStore(db, getLogger);
    const clientMetricsStore = new ClientMetricsStore(db, getLogger);

    return {
        db,
        eventStore,
        featureToggleStore: new FeatureToggleStore(db, eventStore, getLogger),
        strategyStore: new StrategyStore(db, eventStore, getLogger),
        clientApplicationsStore: new ClientApplicationsStore(
            db,
            eventBus,
            getLogger
        ),
        clientInstanceStore: new ClientInstanceStore(db, eventBus, getLogger),
        clientMetricsEventStore: new ClientMetricsEventStore(
            clientMetricsDb,
            eventBus,
            getLogger
        ),
    };
};
