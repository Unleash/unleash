import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper';
import getLogger from '../../../../test/fixtures/no-logger';
import { DEFAULT_ENV } from '../../../util/constants';

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
                { contextName: 'userId', operator: 'IN', values: ['123'] },
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

    expect(body.features).toMatchObject(deltaBody.updated);
});

test('should get 304 if asked for latest revision', async () => {
    await setupFeatures(db, app);

    const { body } = await app.request.get('/api/client/delta').expect(200);
    const currentRevisionId = body.revisionId;

    await app.request
        .set('If-None-Match', currentRevisionId)
        .get('/api/client/delta')
        .expect(304);
});

test('should return correct delta after feature created', async () => {
    await app.createFeature('base_feature');
    await syncRevisions();
    const { body } = await app.request.get('/api/client/delta').expect(200);
    const currentRevisionId = body.revisionId;

    expect(body).toMatchObject({
        updated: [
            {
                name: 'base_feature',
            },
        ],
    });

    await app.createFeature('new_feature');

    await syncRevisions();

    const { body: deltaBody } = await app.request
        .get('/api/client/delta')
        .set('If-None-Match', currentRevisionId)
        .expect(200);

    expect(deltaBody).toMatchObject({
        updated: [
            {
                name: 'new_feature',
            },
        ],
    });
});

const syncRevisions = async () => {
    await app.services.configurationRevisionService.updateMaxRevisionId();
    // @ts-ignore
    await app.services.clientFeatureToggleService.clientFeatureToggleDelta.onUpdateRevisionEvent();
};
