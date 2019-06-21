'use strict';

const { EventEmitter } = require('events');
const migrator = require('../../../migrator');
const { createStores } = require('../../../lib/storage');
const { createDb } = require('../../../lib/storage/db/db-pool');

const dbState = require('./database.json');

require('db-migrate-shared').log.silence(true);

// because of migrator bug
delete process.env.DATABASE_URL;

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

module.exports = async function init(databaseSchema = 'test', getLogger) {
    const options = {
        databaseUrl: require('./database-config').getDatabaseUrl(),
        databaseSchema,
        minPool: 0,
        maxPool: 0,
        getLogger,
    };

    const db = createDb(options);
    const eventBus = new EventEmitter();

    await db.raw(`CREATE SCHEMA IF NOT EXISTS ${options.databaseSchema}`);
    await migrator(options);
    await db.destroy();
    const stores = await createStores(options, eventBus);
    await resetDatabase(stores);
    await setupDatabase(stores);

    return stores;
};
