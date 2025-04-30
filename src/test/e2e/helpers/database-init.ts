import { createStores } from '../../../lib/db/index.js';
import { createDb } from '../../../lib/db/db-pool.js';
import { getDbConfig } from './database-config.js';
import { createTestConfig } from '../../config/test-config.js';
import dbState from './database.json' with { type: 'json' };
import type { LogProvider } from '../../../lib/logger.js';
import noLoggerProvider from '../../fixtures/no-logger.js';
import type EnvironmentStore from '../../../lib/features/project-environments/environment-store.js';
import type { IUnleashStores } from '../../../lib/types/index.js';
import type { IFeatureEnvironmentStore } from '../../../lib/types/stores/feature-environment-store.js';
import { DEFAULT_ENV } from '../../../lib/util/constants.js';
import type {
    IUnleashConfig,
    IUnleashOptions,
    Knex,
} from '../../../lib/server-impl.js';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { migrateDb } from '../../../migrator.js';

// require('db-migrate-shared').log.silence(false);

// because of db-migrate bug (https://github.com/Unleash/unleash/issues/171)
process.setMaxListeners(0);

export const testDbPrefix = 'unleashtestdb_';

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
    config: IUnleashConfig;
    stores: IUnleashStores;
    reset: () => Promise<void>;
    destroy: () => Promise<void>;
    rawDatabase: Knex;
}

type DBTestOptions = {
    dbInitMethod?: 'legacy' | 'template';
    stopMigrationAt?: string; // filename where migration should stop
};

export default async function init(
    databaseSchema = 'test',
    getLogger: LogProvider = noLoggerProvider,
    configOverride: Partial<IUnleashOptions & DBTestOptions> = {},
): Promise<ITestDb> {
    const testDbName = `${testDbPrefix}${uuidv4().replace(/-/g, '')}`;
    const useDbTemplate =
        (configOverride.dbInitMethod ?? 'template') === 'template';
    const testDBTemplateName = process.env.TEST_DB_TEMPLATE_NAME;
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

    if (useDbTemplate) {
        if (!testDBTemplateName) {
            throw new Error(
                'TEST_DB_TEMPLATE_NAME environment variable is not set',
            );
        }
        const client = new Client(getDbConfig());
        await client.connect();

        await client.query(
            `CREATE DATABASE ${testDbName} TEMPLATE ${testDBTemplateName}`,
        );
        await client.query(`ALTER DATABASE ${testDbName} SET TIMEZONE TO UTC`);

        await client.end();
    } else {
        const db = createDb(config);

        await db.raw(`DROP SCHEMA IF EXISTS ${config.db.schema} CASCADE`);
        await db.raw(`CREATE SCHEMA IF NOT EXISTS ${config.db.schema}`);
        await migrateDb(config, configOverride.stopMigrationAt);
        await db.destroy();
    }

    const testDb = createDb(config);
    const stores = createStores(config, testDb);
    stores.eventStore.setMaxListeners(0);

    if (!useDbTemplate) {
        const defaultRolePermissions =
            await getDefaultEnvRolePermissions(testDb);
        await resetDatabase(testDb);
        await setupDatabase(stores);
        await restoreRolePermissions(testDb, defaultRolePermissions);
    }

    return {
        config,
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
