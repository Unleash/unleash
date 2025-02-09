import { log } from 'db-migrate-shared';
import { migrateDb } from '../../../migrator';
import { createStores } from '../../../lib/db';
import { createDb } from '../../../lib/db/db-pool';
import { getDbConfig } from './database-config';
import { createTestConfig } from '../../config/test-config';
import dbState from './database.json';
import type { LogProvider } from '../../../lib/logger';
import noLoggerProvider from '../../fixtures/no-logger';
import type EnvironmentStore from '../../../lib/features/project-environments/environment-store';
import type { IUnleashStores } from '../../../lib/types';
import type { IFeatureEnvironmentStore } from '../../../lib/types/stores/feature-environment-store';
import { DEFAULT_ENV } from '../../../lib/util/constants';
import type { IUnleashOptions, Knex } from '../../../lib/server-impl';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// require('db-migrate-shared').log.silence(false);

// because of migrator bug
delete process.env.DATABASE_URL;

// because of db-migrate bug (https://github.com/Unleash/unleash/issues/171)
process.setMaxListeners(0);

async function getDefaultEnvRolePermissions(knex) {
    return knex.table('role_permission').whereIn('environment', ['default']);
}

async function restoreRolePermissions(knex, rolePermissions) {
    await knex.table('role_permission').insert(rolePermissions);
}

async function resetDatabase(knex) {
    return Promise.all([
        knex
            .table('environments')
            .del(), // deletes role permissions transitively
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
        knex.table('api_tokens').del(),
        knex.table('api_token_project').del(),
        knex
            .table('reset_tokens')
            .del(),
        // knex.table('settings').del(),
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
    rawDatabase: Knex;
}

type DBTestOptions = {
    dbInitMethod?: 'legacy' | 'template';
};

export default async function init(
    databaseSchema = 'test',
    getLogger: LogProvider = noLoggerProvider,
    configOverride: Partial<IUnleashOptions & DBTestOptions> = {},
): Promise<ITestDb> {
    const testDbName = `unleashtestdb_${uuidv4().replace(/-/g, '')}`;
    const useDbTemplate = configOverride.dbInitMethod === 'template' || true;
    const config = createTestConfig({
        db: {
            ...getDbConfig(),
            pool: { min: 1, max: 4 },
            ...(useDbTemplate
                ? { database: testDbName }
                : { schema: databaseSchema }),
            ssl: false,
        },
        ...configOverride,
        getLogger,
    });

    log.setLogLevel('error');

    if (useDbTemplate) {
        const templateDBSchemaName = 'unleash_template_db';
        const testDB = { ...config.db, database: 'unleash_test' };
        const client = new Client(testDB);
        await client.connect();

        await client.query(
            `CREATE DATABASE ${testDbName} TEMPLATE ${templateDBSchemaName}`,
        );
        await client.end();
    } else {
        const db = createDb(config);

        await db.raw(`DROP SCHEMA IF EXISTS ${config.db.schema} CASCADE`);
        await db.raw(`CREATE SCHEMA IF NOT EXISTS ${config.db.schema}`);
        await migrateDb(config);
        await db.destroy();
    }

    const testDb = createDb(config);
    const stores = await createStores(config, testDb);
    stores.eventStore.setMaxListeners(0);

    if (!useDbTemplate) {
        const defaultRolePermissions =
            await getDefaultEnvRolePermissions(testDb);
        await resetDatabase(testDb);
        await setupDatabase(stores);
        await restoreRolePermissions(testDb, defaultRolePermissions);
    }

    return {
        rawDatabase: testDb,
        stores,
        reset: async () => {
            if (!useDbTemplate) {
                const defaultRolePermissions =
                    await getDefaultEnvRolePermissions(testDb);
                await resetDatabase(testDb);
                await setupDatabase(stores);
                await restoreRolePermissions(testDb, defaultRolePermissions);
            }
        },
        destroy: async () => {
            return new Promise<void>((resolve, reject) => {
                testDb.destroy((error) => (error ? reject(error) : resolve()));
            });
        },
    };
}

module.exports = init;
