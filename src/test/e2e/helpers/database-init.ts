import { EventEmitter } from 'events';
import migrator from '../../../migrator';
import { createStores } from '../../../lib/db';
import { createDb } from '../../../lib/db/db-pool';
import dbConfig from './database-config';
import { createTestConfig } from '../../config/test-config';
import dbState from './database.json';
import { LogProvider } from '../../../lib/logger';
import noLoggerProvider from '../../fixtures/no-logger';
import EnvironmentStore from '../../../lib/db/environment-store';

// require('db-migrate-shared').log.silence(false);

// because of migrator bug
delete process.env.DATABASE_URL;

// because of db-migrate bug (https://github.com/Unleash/unleash/issues/171)
process.setMaxListeners(0);

async function resetDatabase(knex) {
    return Promise.all([
        knex.table('strategies').del(),
        knex.table('features').del(),
        knex.table('client_applications').del(),
        knex.table('client_instances').del(),
        knex.table('context_fields').del(),
        knex.table('users').del(),
        knex.table('projects').del(),
        knex.table('tags').del(),
        knex.table('tag_types').del(),
        knex.table('addons').del(),
        knex.table('users').del(),
        knex.table('reset_tokens').del(),
    ]);
}

function createStrategies(store) {
    return dbState.strategies.map(s => store.createStrategy(s));
}

function createContextFields(store) {
    return dbState.contextFields.map(c => store.create(c));
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

async function connectProject(store: EnvironmentStore): Promise<void> {
    await store.connectProject(':global:', 'default');
}

async function createEnvironment(store: EnvironmentStore) {
    await store.upsert({
        name: ':global:',
        displayName: 'Default environment',
    });
}

async function setupDatabase(stores) {
    await createEnvironment(stores.environmentStore);
    await Promise.all(createStrategies(stores.strategyStore));
    await Promise.all(createContextFields(stores.contextFieldStore));
    await Promise.all(createFeatures(stores.featureToggleStore));
    await Promise.all(createClientInstance(stores.clientInstanceStore));
    await Promise.all(createApplications(stores.clientApplicationsStore));
    await Promise.all(createProjects(stores.projectStore));
    await Promise.all(createTagTypes(stores.tagTypeStore));
    await tagFeatures(stores.tagStore, stores.featureTagStore);
    await connectProject(stores.environmentStore);
}

export default async function init(
    databaseSchema: String = 'test',
    getLogger: LogProvider = noLoggerProvider,
): Promise<any> {
    const config = createTestConfig({
        db: {
            ...dbConfig.getDb(),
            pool: { min: 2, max: 8 },
            schema: databaseSchema,
            ssl: false,
        },
        getLogger,
    });

    const db = createDb(config);
    const eventBus = new EventEmitter();

    await db.raw(`DROP SCHEMA IF EXISTS ${config.db.schema} CASCADE`);
    await db.raw(`CREATE SCHEMA IF NOT EXISTS ${config.db.schema}`);
    // @ts-ignore
    await migrator({ ...config, databaseSchema: config.db.schema });
    await db.destroy();
    const stores = await createStores(config, eventBus);
    stores.clientMetricsStore.setMaxListeners(0);
    stores.eventStore.setMaxListeners(0);
    await resetDatabase(stores.db);
    await setupDatabase(stores);

    return {
        stores,
        reset: async () => {
            await resetDatabase(stores.db);
            await setupDatabase(stores);
        },
        destroy: async () => {
            const { clientInstanceStore, clientMetricsStore } = stores;
            return new Promise<void>((resolve, reject) => {
                clientInstanceStore.destroy();
                clientMetricsStore.destroy();
                stores.db.destroy(error => (error ? reject(error) : resolve()));
            });
        },
    };
}

module.exports = init;
