import dbInit, { ITestDb } from '../../../helpers/database-init';
import {
    IUnleashTest,
    insertFeatureEnvironmentsLastSeen,
    insertLastSeenAt,
    setupAppWithCustomConfig,
} from '../../../helpers/test-helper';
import getLogger from '../../../../fixtures/no-logger';

import { IProjectStore } from 'lib/types';
import { DEFAULT_ENV } from '../../../../../lib/util';

let app: IUnleashTest;
let db: ITestDb;

let projectStore: IProjectStore;

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

afterEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should report has strategies and enabled strategies', async () => {
    const app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {},
            },
        },
        db.rawDatabase,
    );
    await app.createFeature('featureWithStrategies');
    await app.createFeature('featureWithoutStrategies');
    await app.createFeature('featureWithDisabledStrategies');
    await app.addStrategyToFeatureEnv(
        {
            name: 'default',
        },
        DEFAULT_ENV,
        'featureWithStrategies',
    );
    await app.addStrategyToFeatureEnv(
        {
            name: 'default',
            disabled: true,
        },
        DEFAULT_ENV,
        'featureWithDisabledStrategies',
    );

    const { body } = await app.request
        .get('/api/admin/projects/default')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        features: [
            {
                name: 'featureWithStrategies',
                environments: [
                    {
                        name: 'default',
                        hasStrategies: true,
                        hasEnabledStrategies: true,
                    },
                ],
            },
            {
                name: 'featureWithoutStrategies',
                environments: [
                    {
                        name: 'default',
                        hasStrategies: false,
                        hasEnabledStrategies: false,
                    },
                ],
            },
            {
                name: 'featureWithDisabledStrategies',
                environments: [
                    {
                        name: 'default',
                        hasStrategies: true,
                        hasEnabledStrategies: false,
                    },
                ],
            },
        ],
    });
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
    await app.createFeature('my-new-feature-toggle');

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
