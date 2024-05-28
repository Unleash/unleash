import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init';
import {
    type IUnleashTest,
    insertLastSeenAt,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper';
import getLogger from '../../../../test/fixtures/no-logger';

let app: IUnleashTest;
let db: ITestDb;

const setupLastSeenAtTest = async (featureName: string) => {
    await app.createFeature(featureName);

    await insertLastSeenAt(featureName, db.rawDatabase, 'default');
    await insertLastSeenAt(featureName, db.rawDatabase, 'development');
    await insertLastSeenAt(featureName, db.rawDatabase, 'production');
};

beforeAll(async () => {
    const config = {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    };

    db = await dbInit(
        'feature_toggles_last_seen_at_refactor',
        getLogger,
        config,
    );
    app = await setupAppWithCustomConfig(db.stores, config, db.rawDatabase);

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

    await app.services.projectService.addEnvironmentToProject(
        'default',
        'development',
    );
    await app.services.projectService.addEnvironmentToProject(
        'default',
        'production',
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should return last seen at per env for /api/admin/features', async () => {
    await app.createFeature('lastSeenAtPerEnv');

    await insertLastSeenAt('lastSeenAtPerEnv', db.rawDatabase, 'default');

    const response = await app.request
        .get('/api/admin/projects/default/features')
        .expect('Content-Type', /json/)
        .expect(200);

    const found = await response.body.features.find(
        (featureToggle) => featureToggle.name === 'lastSeenAtPerEnv',
    );

    expect(found.environments[0].lastSeenAt).toEqual(
        '2023-10-01T12:34:56.000Z',
    );
});

test('response should include last seen at per environment for multiple environments in /api/admin/features', async () => {
    const featureName = 'multiple-environment-last-seen-at';

    await setupLastSeenAtTest(featureName);
    const { body } = await app.request
        .get('/api/admin/projects/default/features')
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

test('response should include last seen at per environment for multiple environments in /api/admin/archive/features', async () => {
    const featureName = 'multiple-environment-last-seen-at-archived';
    await setupLastSeenAtTest(featureName);

    await app.request
        .delete(`/api/admin/projects/default/features/${featureName}`)
        .expect(202);

    const { body } = await app.request.get(`/api/admin/archive/features`);

    const featureEnvironments = body.features[0].environments;
    const [def, development, production] = featureEnvironments;

    expect(def.name).toBe('default');
    expect(def.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');

    expect(development.name).toBe('development');
    expect(development.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');

    expect(production.name).toBe('production');
    expect(production.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');
});

test('response should include last seen at per environment for multiple environments in /api/admin/archive/features/:projectId', async () => {
    const featureName = 'multiple-environment-last-seen-at-archived-project';
    await setupLastSeenAtTest(featureName);

    await app.request
        .delete(`/api/admin/projects/default/features/${featureName}`)
        .expect(202);

    const { body } = await app.request.get(
        `/api/admin/archive/features/default`,
    );

    const featureEnvironments = body.features[0].environments;
    const [def, development, production] = featureEnvironments;

    expect(def.name).toBe('default');
    expect(def.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');

    expect(development.name).toBe('development');
    expect(development.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');

    expect(production.name).toBe('production');
    expect(production.lastSeenAt).toEqual('2023-10-01T12:34:56.000Z');
});

test('response should include last seen at per environment correctly for a single toggle /api/admin/project/:projectId/features/:featureName', async () => {
    const featureName = 'multiple-environment-last-seen-at-single-toggle';
    await app.createFeature(featureName);
    await setupLastSeenAtTest(`${featureName}1`);
    await setupLastSeenAtTest(`${featureName}2`);
    await setupLastSeenAtTest(`${featureName}3`);
    await setupLastSeenAtTest(`${featureName}4`);
    await setupLastSeenAtTest(`${featureName}5`);

    await insertLastSeenAt(
        featureName,
        db.rawDatabase,
        'default',
        '2023-08-01 12:30:56',
    );

    await insertLastSeenAt(
        featureName,
        db.rawDatabase,
        'development',
        '2023-08-01 12:30:56',
    );

    await insertLastSeenAt(
        featureName,
        db.rawDatabase,
        'production',
        '2023-08-01 12:30:56',
    );

    const { body } = await app.request
        .get(`/api/admin/projects/default/features/${featureName}`)
        .expect(200);

    const expected = [
        {
            name: 'default',
            lastSeenAt: '2023-08-01T12:30:56.000Z',
        },
        {
            name: 'development',
            lastSeenAt: '2023-08-01T12:30:56.000Z',
        },
        {
            name: 'production',
            lastSeenAt: '2023-08-01T12:30:56.000Z',
        },
    ];

    const toObject = (lastSeenAtEnvData) =>
        Object.fromEntries(
            lastSeenAtEnvData.map((env) => [
                env.name,
                { lastSeenAt: env.lastSeenAt },
            ]),
        );

    expect(toObject(body.environments)).toMatchObject(toObject(expected));
});
