import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import {
    CLIENT_METRICS,
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    type IEventStore,
} from '../../types';
import type EventEmitter from 'events';
import {
    type FeatureLifecycleService,
    STAGE_ENTERED,
} from './feature-lifecycle-service';
import type { StageName } from './feature-lifecycle-store-type';

let app: IUnleashTest;
let db: ITestDb;
let featureLifecycleService: FeatureLifecycleService;
let eventStore: IEventStore;
let eventBus: EventEmitter;

beforeAll(async () => {
    db = await dbInit('feature_lifecycle', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    featureLifecycle: true,
                },
            },
        },
        db.rawDatabase,
    );
    eventStore = db.stores.eventStore;
    eventBus = app.config.eventBus;
    featureLifecycleService = app.services.featureLifecycleService;

    await app.request
        .post(`/auth/demo/login`)
        .send({
            email: 'user@getunleash.io',
        })
        .expect(200);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {});

const getFeatureLifecycle = async (featureName: string, expectedCode = 200) => {
    return app.request
        .get(`/api/admin/projects/default/features/${featureName}/lifecycle`)
        .expect(expectedCode);
};

function reachedStage(name: StageName) {
    return new Promise((resolve) =>
        featureLifecycleService.on(STAGE_ENTERED, (event) => {
            if (event.stage === name) resolve(name);
        }),
    );
}

test('should return lifecycle stages', async () => {
    await app.createFeature('my_feature_a');
    eventStore.emit(FEATURE_CREATED, { featureName: 'my_feature_a' });
    await reachedStage('initial');
    eventBus.emit(CLIENT_METRICS, {
        featureName: 'my_feature_a',
        environment: 'default',
    });
    await reachedStage('live');
    eventStore.emit(FEATURE_ARCHIVED, { featureName: 'my_feature_a' });
    await reachedStage('archived');

    const { body } = await getFeatureLifecycle('my_feature_a');

    expect(body).toEqual([
        { stage: 'initial', enteredStageAt: expect.any(String) },
        { stage: 'live', enteredStageAt: expect.any(String) },
        { stage: 'archived', enteredStageAt: expect.any(String) },
    ]);
});
