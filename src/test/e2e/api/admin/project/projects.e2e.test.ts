import dbInit, { ITestDb } from '../../../helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../helpers/test-helper';
import getLogger from '../../../../fixtures/no-logger';

import { IProjectStore } from 'lib/types';
import { Knex } from 'knex';

let app: IUnleashTest;
let db: ITestDb;

let projectStore: IProjectStore;

export const insertLastSeenAt = async (
    featureName: string,
    db: Knex,
    environment: string = 'default',
    date: string = '2023-10-01 12:34:56',
): Promise<string> => {
    await db.raw(`INSERT INTO last_seen_at_metrics (feature_name, environment, last_seen_at)
        VALUES ('${featureName}', '${environment}', '${date}');`);

    return date;
};

export const insertFeatureEnvironmentsLastSeen = async (
    featureName: string,
    db: Knex,
    environment: string = 'default',
    date: string = '2022-05-01 12:34:56',
): Promise<string> => {
    await db.raw(`
        INSERT INTO feature_environments (feature_name, environment, last_seen_at, enabled)
        VALUES ('${featureName}', '${environment}', '${date}', true)
        ON CONFLICT (feature_name, environment) DO UPDATE SET last_seen_at = '${date}', enabled = true;
    `);

    return date;
};

beforeAll(async () => {
    db = await dbInit('projects_api_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );
    projectStore = db.stores.projectStore;
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('Should ONLY return default project', async () => {
    projectStore.create({
        id: 'test2',
        name: 'test',
        description: '',
        mode: 'open',
    });

    const { body } = await app.request
        .get('/api/admin/projects')
        .expect(200)
        .expect('Content-Type', /json/);

    expect(body.projects).toHaveLength(1);
    expect(body.projects[0].id).toBe('default');
});

test('response should include created_at', async () => {
    const { body } = await app.request
        .get('/api/admin/projects')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.projects[0].createdAt).toBeDefined();
});

test('response for default project should include created_at', async () => {
    const { body } = await app.request
        .get('/api/admin/projects/default')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.createdAt).toBeDefined();
});

test('response should include last seen at per environment', async () => {
    await app.createFeature('my-new-feature-toggle');

    await insertLastSeenAt('my-new-feature-toggle', db.rawDatabase, 'default');
    await insertFeatureEnvironmentsLastSeen(
        'my-new-feature-toggle',
        db.rawDatabase,
        'default',
    );

    const { body } = await app.request
        .get('/api/admin/projects/default')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.features[0].environments[0].lastSeenAt).toEqual(
        '2022-05-01T12:34:56.000Z',
    );

    const appWithLastSeenRefactor = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    useLastSeenRefactor: true,
                },
            },
        },
        db.rawDatabase,
    );

    const response = await appWithLastSeenRefactor.request
        .get('/api/admin/projects/default')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(response.body.features[0].environments[0].lastSeenAt).toEqual(
        '2023-10-01T12:34:56.000Z',
    );
});

test('response should include last seen at per environment for multiple environments', async () => {
    const appWithLastSeenRefactor = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    useLastSeenRefactor: true,
                },
            },
        },
        db.rawDatabase,
    );

    await db.stores.environmentStore.create({
        name: 'development',
        type: 'development',
        sortOrder: 1,
        enabled: true,
    });

    await db.stores.environmentStore.create({
        name: 'production',
        type: 'production',
        sortOrder: 2,
        enabled: true,
    });

    await appWithLastSeenRefactor.services.projectService.addEnvironmentToProject(
        'default',
        'development',
    );
    await appWithLastSeenRefactor.services.projectService.addEnvironmentToProject(
        'default',
        'production',
    );

    await appWithLastSeenRefactor.createFeature(
        'multiple-environment-last-seen-at',
    );

    await insertLastSeenAt(
        'multiple-environment-last-seen-at',
        db.rawDatabase,
        'default',
    );
    await insertLastSeenAt(
        'multiple-environment-last-seen-at',
        db.rawDatabase,
        'development',
    );
    await insertLastSeenAt(
        'multiple-environment-last-seen-at',
        db.rawDatabase,
        'production',
    );

    const { body } = await appWithLastSeenRefactor.request
        .get('/api/admin/projects/default')
        .expect('Content-Type', /json/)
        .expect(200);

    const featureEnvironments = body.features[1].environments;

    const [def, development, production] = featureEnvironments;

    expect(def.name).toBe('default');
    expect(def.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');

    expect(development.name).toBe('development');
    expect(development.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');

    expect(production.name).toBe('production');
    expect(production.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');
});
