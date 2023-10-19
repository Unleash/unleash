import dbInit, { ITestDb } from '../../../../test/e2e/helpers/database-init';
import {
    IUnleashTest,
    insertLastSeenAt,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper';
import getLogger from '../../../../test/fixtures/no-logger';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    const config = {
        experimental: {
            flags: {
                strictSchemaValidation: true,
                dependentFeatures: true,
                separateAdminClientApi: true,
                useLastSeenRefactor: true,
            },
        },
    };

    db = await dbInit(
        'feature_toggles_last_seen_at_refactor',
        getLogger,
        config,
    );
    app = await setupAppWithCustomConfig(db.stores, config, db.rawDatabase);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should return last seen at per env for /api/admin/features', async () => {
    await app.createFeature('lastSeenAtPerEnv');

    await insertLastSeenAt('lastSeenAtPerEnv', db.rawDatabase, 'default');

    const response = await app.request
        .get('/api/admin/features')
        .expect('Content-Type', /json/)
        .expect(200);

    const found = await response.body.features.find(
        (featureToggle) => featureToggle.name === 'lastSeenAtPerEnv',
    );

    expect(found.environments[0].lastSeenAt).toEqual(
        '2023-10-01T12:34:56.000Z',
    );
});

test('response should include last seen at per environment for multiple environments', async () => {
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

    await app.createFeature('multiple-environment-last-seen-at');

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

    const { body } = await app.request
        .get('/api/admin/features')
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
