'use strict';

const { createStores } = require('../../../lib/db');
const { createDb } = require('../../../lib/db/db-pool');

const dbState = require('./database.json');

// require('db-migrate-shared').log.silence(true);

// because of db-migrate bug (https://github.com/Unleash/unleash/issues/171)
process.setMaxListeners(0);

async function resetDatabase(stores) {
    return Promise.all([
        stores.db('strategies').del(),
        stores.db('features').del(),
        stores.db('client_applications').del(),
        stores.db('client_instances').del(),
    ]);
}

async function setupDatabase(stores) {
    const updates = [];
    updates.push(...createStrategies(stores.strategyStore));
    updates.push(...createFeatures(stores.featureToggleStore));
    updates.push(...createClientInstance(stores.clientInstanceStore));
    updates.push(...createApplications(stores.clientApplicationsStore));

    await Promise.all(updates);
}

function createStrategies(store) {
    return dbState.strategies.map(s => store._createStrategy(s));
}

function createApplications(store) {
    return dbState.applications.map(a => store.upsert(a));
}

function createClientInstance(store) {
    return dbState.clientInstances.map(i => store.insert(i));
}

function createFeatures(store) {
    return dbState.features.map(f => store._createFeature(f));
}

module.exports = async function init(getLogger) {
    const options = {
        getLogger,
    };

    const db = await createDb();

    await db.migrate.latest();

    const stores = await createStores(options);
    await resetDatabase(stores);
    await setupDatabase(stores);

    return stores;
};
