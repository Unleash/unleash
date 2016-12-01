'use strict';

const ClientMetricsStore = require('./fake-metrics-store');
const clientStrategyStore = require('./fake-client-strategy-store');
const clientInstanceStore = require('./fake-client-instance-store');
const featureToggleStore = require('./fake-feature-toggle-store');
const eventStore = require('./fake-event-store');
const strategyStore = require('./fake-strategies-store');



module.exports = {
    createStores: () => {
        const db = {
            select: () => ({
                from: () => Promise.resolve(),
            }),
        };

        return {
            db,
            clientMetricsStore: new ClientMetricsStore(),
            clientStrategyStore: clientStrategyStore(),
            clientInstanceStore: clientInstanceStore(),
            featureToggleStore: featureToggleStore(),
            eventStore: eventStore(),
            strategyStore: strategyStore(),
        };
    },
};
