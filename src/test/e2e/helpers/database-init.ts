import { migrateDb } from '../../../migrator';
import { createStores } from '../../../lib/db';
import { createDb } from '../../../lib/db/db-pool';
import { getDbConfig } from './database-config';
import { createTestConfig } from '../../config/test-config';
import dbState from './database.json';
import { LogProvider } from '../../../lib/logger';
import noLoggerProvider from '../../fixtures/no-logger';
import EnvironmentStore from '../../../lib/db/environment-store';
import { IUnleashStores } from '../../../lib/types';
import { IFeatureEnvironmentStore } from '../../../lib/types/stores/feature-environment-store';
import { DEFAULT_ENV } from '../../../lib/util/constants';
import { IUnleashOptions } from 'lib/server-impl';

// require('db-migrate-shared').log.silence(false);

// because of migrator bug
delete process.env.DATABASE_URL;

// because of db-migrate bug (https://github.com/Unleash/unleash/issues/171)
process.setMaxListeners(0);

async function resetDatabase(knex) {
    return Promise.all([
        knex.table('environments').del(),
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
    return dbState.strategies.map((s) => store.createStrategy(s));
}

function createContextFields(store) {
    return dbState.contextFields.map((c) => store.create(c));
}

function createProjects(store) {
    return dbState.projects.map((i) => store.create(i));
}

function createTagTypes(store) {
    return dbState.tag_types.map((t) => store.createTagType(t));
}

async function connectProject(store: IFeatureEnvironmentStore): Promise<void> {
    await store.connectProject(DEFAULT_ENV, 'default');
}

async function createEnvironments(store: EnvironmentStore): Promise<void> {
    await Promise.all(dbState.environments.map(async (e) => store.create(e)));
}

async function setupDatabase(stores) {
    await createEnvironments(stores.environmentStore);
    await Promise.all(createStrategies(stores.strategyStore));
    await Promise.all(createContextFields(stores.contextFieldStore));
    await Promise.all(createProjects(stores.projectStore));
    await Promise.all(createTagTypes(stores.tagTypeStore));
    await connectProject(stores.featureEnvironmentStore);
}

export interface ITestDb {
    stores: IUnleashStores;
    reset: () => Promise<void>;
    destroy: () => Promise<void>;
}

export default async function init(
    databaseSchema: string = 'test',
    getLogger: LogProvider = noLoggerProvider,
    configOverride: Partial<IUnleashOptions> = {},
): Promise<ITestDb> {
    const config = createTestConfig({
        db: {
            ...getDbConfig(),
            pool: { min: 1, max: 4 },
            schema: databaseSchema,
            ssl: false,
        },
        ...configOverride,
        getLogger,
    });

    const db = createDb(config);

    await db.raw(`DROP SCHEMA IF EXISTS ${config.db.schema} CASCADE`);
    await db.raw(`CREATE SCHEMA IF NOT EXISTS ${config.db.schema}`);
    // @ts-expect-error
    await migrateDb({ ...config, databaseSchema: config.db.schema });
    await db.destroy();
    const testDb = createDb(config);
    const stores = await createStores(config, testDb);
    stores.eventStore.setMaxListeners(0);
    await resetDatabase(testDb);
    await setupDatabase(stores);

    return {
        stores,
        reset: async () => {
            await resetDatabase(testDb);
            await setupDatabase(stores);
        },
        destroy: async () => {
            const { clientInstanceStore } = stores;
            return new Promise<void>((resolve, reject) => {
                clientInstanceStore.destroy();
                testDb.destroy((error) => (error ? reject(error) : resolve()));
            });
        },
    };
}

module.exports = init;
