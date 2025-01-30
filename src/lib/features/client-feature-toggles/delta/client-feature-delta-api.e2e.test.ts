import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper';
import getLogger from '../../../../test/fixtures/no-logger';
import { DEFAULT_ENV } from '../../../util/constants';
import { DELTA_EVENT_TYPES } from './client-feature-toggle-delta-types';

let app: IUnleashTest;
let db: ITestDb;

const setupFeatures = async (
    db: ITestDb,
    app: IUnleashTest,
    project = 'default',
) => {
    await app.createFeature('test1', project);
    await app.createFeature('test2', project);

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
        project,
    );
    await app.addStrategyToFeatureEnv(
        {
            name: 'default',
            constraints: [
                {
                    contextName: 'userId',
                    operator: 'IN',
                    values: ['123'],
                },
            ],
            parameters: {},
        },
        DEFAULT_ENV,
        'test2',
        project,
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
    // @ts-ignore
    app.services.clientFeatureToggleService.clientFeatureToggleDelta.resetDelta();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should match with /api/client/delta', async () => {
    await setupFeatures(db, app);

    const { body } = await app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200);

    const { body: deltaBody } = await app.request
        .get('/api/client/delta')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.features).toMatchObject(deltaBody.events[0].features);
});

test('should get 304 if asked for latest revision', async () => {
    await setupFeatures(db, app);

    const { body, headers } = await app.request
        .get('/api/client/delta')
        .expect(200);
    const etag = headers.etag;

    await app.request
        .set('If-None-Match', etag)
        .get('/api/client/delta')
        .expect(304);
});

test('should return correct delta after feature created', async () => {
    await app.createFeature('base_feature');
    await syncRevisions();
    const { body, headers } = await app.request
        .set('If-None-Match', null)
        .get('/api/client/delta')
        .expect(200);
    const etag = headers.etag;

    expect(body).toMatchObject({
        events: [
            {
                type: DELTA_EVENT_TYPES.HYDRATION,
                features: [
                    {
                        name: 'base_feature',
                    },
                ],
            },
        ],
    });

    await app.createFeature('new_feature');

    await syncRevisions();

    const { body: deltaBody } = await app.request
        .get('/api/client/delta')
        .set('If-None-Match', etag)
        .expect(200);

    expect(deltaBody).toMatchObject({
        events: [
            {
                type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
                feature: {
                    name: 'new_feature',
                },
            },
        ],
    });
});

const syncRevisions = async () => {
    await app.services.configurationRevisionService.updateMaxRevisionId(false);
    //@ts-ignore
    await app.services.clientFeatureToggleService.clientFeatureToggleDelta.onUpdateRevisionEvent();
};

test('archived features should not be returned as updated', async () => {
    await app.createFeature('base_feature');
    await syncRevisions();
    const { body, headers } = await app.request
        .get('/api/client/delta')
        .expect(200);
    const etag = headers.etag;

    expect(body).toMatchObject({
        events: [
            {
                features: [
                    {
                        name: 'base_feature',
                    },
                ],
            },
        ],
    });

    await app.archiveFeature('base_feature');
    await syncRevisions();
    await app.createFeature('new_feature');
    await syncRevisions();
    await app.getProjectFeatures('new_feature'); // TODO: this is silly, but events syncing and tests do not work nicely. this is basically a setTimeout

    const { body: deltaBody } = await app.request
        .get('/api/client/delta')
        .set('If-None-Match', etag)
        .expect(200);

    expect(deltaBody).toMatchObject({
        events: [
            {
                type: DELTA_EVENT_TYPES.FEATURE_REMOVED,
                featureName: 'base_feature',
            },
            {
                type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
                feature: {
                    name: 'new_feature',
                },
            },
        ],
    });
});

test('should get segment updated and removed events', async () => {
    await app.createFeature('base_feature');
    await syncRevisions();
    const { body, headers } = await app.request
        .get('/api/client/delta')
        .expect(200);
    const etag = headers.etag;

    expect(body).toMatchObject({
        events: [
            {
                type: DELTA_EVENT_TYPES.HYDRATION,
                features: [
                    {
                        name: 'base_feature',
                    },
                ],
            },
        ],
    });

    const { body: segmentBody } = await app.createSegment({
        name: 'my_segment_a',
        constraints: [],
    });
    // we need this, because revision service does not fire event for segment creation
    await app.createFeature('not_important1');
    await syncRevisions();
    await app.updateSegment(segmentBody.id, {
        name: 'a',
        constraints: [],
    });
    await syncRevisions();
    await app.deleteSegment(segmentBody.id);
    // we need this, because revision service does not fire event for segment deletion
    await app.createFeature('not_important2');
    await syncRevisions();

    const { body: deltaBody } = await app.request
        .get('/api/client/delta')
        .set('If-None-Match', etag)
        .expect(200);

    expect(deltaBody).toMatchObject({
        events: [
            {
                type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
            },
            {
                type: DELTA_EVENT_TYPES.SEGMENT_UPDATED,
            },

            {
                type: DELTA_EVENT_TYPES.SEGMENT_UPDATED,
            },
            {
                type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
            },
            {
                type: DELTA_EVENT_TYPES.SEGMENT_REMOVED,
            },
        ],
    });
});
