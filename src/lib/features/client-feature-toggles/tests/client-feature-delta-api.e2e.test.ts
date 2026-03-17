import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import { DEFAULT_ENV } from '../../../util/constants.js';

let app: IUnleashTest;
let db: ITestDb;

const syncRevisions = async () => {
    await app.services.configurationRevisionService.updateMaxRevisionId();
    const delta = (app.services.clientFeatureToggleService as any)
        .clientFeatureToggleDelta;
    await delta?.onUpdateRevisionEvent();
};

const setupFeatures = async () => {
    await app.createFeature('test1');
    await app.addStrategyToFeatureEnv(
        {
            name: 'flexibleRollout',
            constraints: [],
            parameters: {
                rollout: '100',
                stickiness: 'default',
                groupId: 'test1',
            },
        },
        DEFAULT_ENV,
        'test1',
    );
};

beforeAll(async () => {
    db = await dbInit('client_feature_toggles_delta', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    deltaApi: true,
                },
            },
        },
        db.rawDatabase,
    );
});

beforeEach(async () => {
    await db.stores.eventStore.deleteAll();
    await db.stores.featureToggleStore.deleteAll();
    const delta = (app.services.clientFeatureToggleService as any)
        .clientFeatureToggleDelta;
    delta?.resetDelta();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('GET /api/client/delta with no features and no If-None-Match returns 200 and ETag', async () => {
    const res = await app.request.get('/api/client/delta').expect(200);

    expect(res.headers.etag).toBe('"0"');
    expect(res.body).toEqual({
        events: [
            {
                eventId: 0,
                type: 'hydration',
                features: [],
                segments: [],
            },
        ],
    });
});

test('GET /api/client/delta with no features and matching If-None-Match returns 304', async () => {
    const initial = await app.request.get('/api/client/delta').expect(200);

    await app.request
        .get('/api/client/delta')
        .set('If-None-Match', initial.headers.etag)
        .expect(304);
});

test('GET /api/client/delta with a feature and no If-None-Match returns 200 and ETag', async () => {
    await setupFeatures();
    await syncRevisions();

    const res = await app.request.get('/api/client/delta').expect(200);

    expect(res.headers.etag).toBeDefined();
    expect(res.body.events).toHaveLength(1);
    expect(res.body.events[0]).toMatchObject({
        type: 'hydration',
        features: [
            expect.objectContaining({
                name: 'test1',
            }),
        ],
    });
});
