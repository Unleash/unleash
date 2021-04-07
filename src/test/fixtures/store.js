'use strict';

const ClientMetricsStore = require('./fake-metrics-store');
const clientInstanceStore = require('./fake-client-instance-store');
const clientApplicationsStore = require('./fake-client-applications-store');
const featureToggleStore = require('./fake-feature-toggle-store');
const tagStore = require('./fake-tag-store');
const tagTypeStore = require('./fake-tag-type-store');
const EventStore = require('./fake-event-store');
const strategyStore = require('./fake-strategies-store');
const contextFieldStore = require('./fake-context-store');
const settingStore = require('./fake-setting-store');
const addonStore = require('./fake-addon-store');
const projectStore = require('./fake-project-store');
const UserStore = require('./fake-user-store');
const AccessStore = require('./fake-access-store');

module.exports = {
    createStores: (databaseIsUp = true) => {
        const db = {
            select: () => ({
                from: () => Promise.resolve(),
            }),
        };

        return {
            db,
            clientApplicationsStore: clientApplicationsStore(databaseIsUp),
            clientMetricsStore: new ClientMetricsStore(databaseIsUp),
            clientInstanceStore: clientInstanceStore(databaseIsUp),
            featureToggleStore: featureToggleStore(databaseIsUp),
            tagStore: tagStore(databaseIsUp),
            tagTypeStore: tagTypeStore(databaseIsUp),
            eventStore: new EventStore(databaseIsUp),
            strategyStore: strategyStore(databaseIsUp),
            contextFieldStore: contextFieldStore(databaseIsUp),
            settingStore: settingStore(databaseIsUp),
            addonStore: addonStore(databaseIsUp),
            projectStore: projectStore(databaseIsUp),
            userStore: new UserStore(),
            accessStore: new AccessStore(),
        };
    },
};
