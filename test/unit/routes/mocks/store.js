const sinon = require('sinon');

const clientMetricsStore = require('./fake-metrics-store');
const clientStrategyStore = require('./fake-client-strategy-store');
const clientInstanceStore = require('./fake-client-instance-store');
const featureToggleStore = require('./fake-feature-toggle-store');
const strategyStore = require('./fake-strategies-store');

module.exports = {
    createStores: () => {
        clientMetricsStore.reset();
        clientStrategyStore.reset();
        clientInstanceStore.reset();
        featureToggleStore.reset();
        strategyStore.reset();

        return {
            db: sinon.stub(),
            clientMetricsStore,
            clientStrategyStore,
            clientInstanceStore,
            featureToggleStore,
            strategyStore,
        }

    }
};