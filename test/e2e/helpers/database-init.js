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
        stores.db('tags').del(),
        stores.db('tag_types').del(),
        stores.db('addons').del(),
    ]);
}

function createStrategies(store) {
    return dbState.strategies.map(s => store.createStrategy(s));
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
    return dbState.features.map(f => store.createFeature(f));
}

async function tagFeatures(tagStore, store) {
    await tagStore.createTag({ value: 'Tester', type: 'simple' });
    return dbState.features.map(f =>
        store.tagFeature(f.name, {
            value: 'Tester',
            type: 'simple',
        }),
    );
}

function createTagTypes(store) {
    return dbState.tag_types.map(t => store.createTagType(t));
}

async function setupDatabase(stores) {
    await Promise.all(createStrategies(stores.strategyStore));
    await Promise.all(createContextFields(stores.contextFieldStore));
    await Promise.all(createFeatures(stores.featureToggleStore));
    await Promise.all(createClientInstance(stores.clientInstanceStore));
    await Promise.all(createApplications(stores.clientApplicationsStore));
    await Promise.all(createProjects(stores.projectStore));
    await Promise.all(createTagTypes(stores.tagTypeStore));
    await tagFeatures(stores.tagStore, stores.featureToggleStore);
}

module.exports = async function init(databaseSchema = 'test', getLogger) {
    const options = {
        db: { ...dbConfig.getDb(), pool: { min: 2, max: 8 } },
        databaseSchema,
        getLogger,
    };

    const db = createDb(options);
    const eventBus = new EventEmitter();

    await db.raw(`DROP SCHEMA IF EXISTS ${options.databaseSchema} CASCADE`);
    await db.raw(`CREATE SCHEMA IF NOT EXISTS ${options.databaseSchema}`);
    await migrator(options);
    await db.destroy();
    const stores = await createStores(options, eventBus);
    stores.clientMetricsStore.setMaxListeners(0);
    stores.eventStore.setMaxListeners(0);
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
