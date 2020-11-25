'use strict';

const { EventEmitter } = require('events');
const migrator = require('../../../migrator');
const { createStores } = require('../../../lib/db');
const { createDb } = require('../../../lib/db/db-pool');
const dbConfig = require('./database-config');

const dbState = require('./database.json');

// require('db-migrate-shared').log.silence(false);

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
        stores.db('context_fields').del(),
        stores.db('users').del(),
        stores.db('projects').del(),
    ]);
}

function createStrategies(store) {
    return dbState.strategies.map(s => store._createStrategy(s));
}

function createContextFields(store) {
    return dbState.contextFields.map(c => store._createContextField(c));
}

function createApplications(store) {
    return dbState.applications.map(a => store.upsert(a));
}

function createClientInstance(store) {
    return dbState.clientInstances.map(i => store.insert(i));
}

function createProjects(store) {
    return dbState.projects.map(i => store.create(i));
}

function createFeatures(store) {
    return dbState.features.map(f => store._createFeature(f));
}

async function setupDatabase(stores) {
    const updates = [];
    updates.push(...createStrategies(stores.strategyStore));
    updates.push(...createContextFields(stores.contextFieldStore));
    updates.push(...createFeatures(stores.featureToggleStore));
    updates.push(...createClientInstance(stores.clientInstanceStore));
    updates.push(...createApplications(stores.clientApplicationsStore));
    updates.push(...createProjects(stores.projectStore));

    await Promise.all(updates);
}

module.exports = async function init(databaseSchema = 'test', getLogger) {
    const options = {
        db: dbConfig.getDb(),
        databaseSchema,
        minPool: 1,
        maxPool: 1,
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

    return {
        stores,
        reset: async () => {
            await resetDatabase(stores);
            await setupDatabase(stores);
        },
    };
};
