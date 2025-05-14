import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    insertLastSeenAt,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import type { IUnleashOptions } from '../../../internals.js';

let app: IUnleashTest;
let db: ITestDb;

const setupLastSeenAtTest = async (featureName: string) => {
    await app.createFeature(featureName);

    await insertLastSeenAt(featureName, db.rawDatabase, 'development');
    await insertLastSeenAt(featureName, db.rawDatabase, 'production');
};

beforeAll(async () => {
    const config: Partial<IUnleashOptions> = {
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
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should return last seen at per env for /api/admin/features', async () => {
    await app.createFeature('lastSeenAtPerEnv');

    await insertLastSeenAt('lastSeenAtPerEnv', db.rawDatabase, 'development');

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

    const [development, production] = featureEnvironments;

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
        'development',
        '2023-08-01T12:30:56.000Z',
    );

    await insertLastSeenAt(
        featureName,
        db.rawDatabase,
        'production',
        '2023-08-01T12:30:56.000Z',
    );

    const { body } = await app.request
        .get(`/api/admin/projects/default/features/${featureName}`)
        .expect(200);

    const expected = [
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
