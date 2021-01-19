'use strict';

const ClientMetricsStore = require('./fake-metrics-store');
const clientInstanceStore = require('./fake-client-instance-store');
const clientApplicationsStore = require('./fake-client-applications-store');
const featureToggleStore = require('./fake-feature-toggle-store');
const tagStore = require('./fake-tag-store');
const tagTypeStore = require('./fake-tag-type-store');
const eventStore = require('./fake-event-store');
const strategyStore = require('./fake-strategies-store');
const contextFieldStore = require('./fake-context-store');
const settingStore = require('./fake-setting-store');
const addonStore = require('./fake-addon-store');

module.exports = {
    createStores: () => {
        const db = {
            select: () => ({
                from: () => Promise.resolve(),
            }),
        };

        return {
            db,
            clientApplicationsStore: clientApplicationsStore(),
            clientMetricsStore: new ClientMetricsStore(),
            clientInstanceStore: clientInstanceStore(),
            featureToggleStore: featureToggleStore(),
            tagStore: tagStore(),
            tagTypeStore: tagTypeStore(),
            eventStore: eventStore(),
            strategyStore: strategyStore(),
            contextFieldStore: contextFieldStore(),
            settingStore: settingStore(),
            addonStore: addonStore(),
        };
    },
};
