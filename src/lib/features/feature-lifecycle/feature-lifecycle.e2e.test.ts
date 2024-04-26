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
    FEATURE_REVIVED,
    type IEventStore,
    type StageName,
} from '../../types';
import type EventEmitter from 'events';
import {
    type FeatureLifecycleService,
    STAGE_ENTERED,
} from './feature-lifecycle-service';

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
const completeFeature = async (featureName: string, expectedCode = 200) => {
    return app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/lifecycle/complete`,
        )
        .expect(expectedCode);
};

const uncompleteFeature = async (featureName: string, expectedCode = 200) => {
    return app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/lifecycle/uncomplete`,
        )
        .expect(expectedCode);
};

function reachedStage(name: StageName) {
    return new Promise((resolve) =>
        featureLifecycleService.on(STAGE_ENTERED, (event) => {
            if (event.stage === name) resolve(name);
        }),
    );
}

const expectFeatureStage = async (featureName: string, stage: StageName) => {
    const { body: feature } = await app.getProjectFeatures(
        'default',
        featureName,
    );
    expect(feature.lifecycle).toMatchObject({
        stage,
        enteredStageAt: expect.any(String),
    });
};

test('should return lifecycle stages', async () => {
    await app.createFeature('my_feature_a');
    await app.enableFeature('my_feature_a', 'default');
    eventStore.emit(FEATURE_CREATED, { featureName: 'my_feature_a' });
    await reachedStage('initial');
    await expectFeatureStage('my_feature_a', 'initial');
    eventBus.emit(CLIENT_METRICS, {
        bucket: {
            toggles: {
                my_feature_a: 'irrelevant',
                non_existent_feature: 'irrelevent',
            },
        },
        environment: 'default',
    });
    // missing feature
    eventBus.emit(CLIENT_METRICS, {
        environment: 'default',
        bucket: { toggles: {} },
    });
    // non existent env
    eventBus.emit(CLIENT_METRICS, {
        bucket: {
            toggles: {
                my_feature_a: 'irrelevant',
            },
        },
        environment: 'non-existent',
    });
    await reachedStage('live');
    await expectFeatureStage('my_feature_a', 'live');
    eventStore.emit(FEATURE_ARCHIVED, { featureName: 'my_feature_a' });
    await reachedStage('archived');

    const { body } = await getFeatureLifecycle('my_feature_a');

    expect(body).toEqual([
        {
            stage: 'initial',
            enteredStageAt: expect.any(String),
        },
        { stage: 'pre-live', enteredStageAt: expect.any(String) },
        {
            stage: 'live',
            enteredStageAt: expect.any(String),
        },
        {
            stage: 'archived',
            enteredStageAt: expect.any(String),
        },
    ]);
    await expectFeatureStage('my_feature_a', 'archived');

    eventStore.emit(FEATURE_REVIVED, { featureName: 'my_feature_a' });
    await reachedStage('initial');
});

test('should be able to toggle between completed/uncompleted', async () => {
    await app.createFeature('my_feature_b');

    await completeFeature('my_feature_b');

    await expectFeatureStage('my_feature_b', 'completed');

    await uncompleteFeature('my_feature_b');

    const { body } = await getFeatureLifecycle('my_feature_b');

    expect(body).toEqual([]);
});
