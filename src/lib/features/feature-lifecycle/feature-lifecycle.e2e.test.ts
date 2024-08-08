import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import {
    CLIENT_METRICS_ADDED,
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_REVIVED,
    type IEventStore,
    type IFeatureLifecycleStore,
    type StageName,
} from '../../types';
import type EventEmitter from 'events';
import type { FeatureLifecycleCompletedSchema } from '../../openapi';
import { FeatureLifecycleReadModel } from './feature-lifecycle-read-model';
import type { IFeatureLifecycleReadModel } from './feature-lifecycle-read-model-type';
import { STAGE_ENTERED } from '../../metric-events';

let app: IUnleashTest;
let db: ITestDb;
let featureLifecycleStore: IFeatureLifecycleStore;
let eventStore: IEventStore;
let eventBus: EventEmitter;
let featureLifecycleReadModel: IFeatureLifecycleReadModel;

beforeAll(async () => {
    db = await dbInit('feature_lifecycle', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {},
            },
        },
        db.rawDatabase,
    );
    eventStore = db.stores.eventStore;
    eventBus = app.config.eventBus;
    featureLifecycleReadModel = new FeatureLifecycleReadModel(
        db.rawDatabase,
        app.config.flagResolver,
    );
    featureLifecycleStore = db.stores.featureLifecycleStore;

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

beforeEach(async () => {
    await featureLifecycleStore.deleteAll();
});

const getFeatureLifecycle = async (featureName: string, expectedCode = 200) => {
    return app.request
        .get(`/api/admin/projects/default/features/${featureName}/lifecycle`)
        .expect(expectedCode);
};

const getCurrentStage = async (featureName: string) => {
    return featureLifecycleReadModel.findCurrentStage(featureName);
};

const completeFeature = async (
    featureName: string,
    status: FeatureLifecycleCompletedSchema,
    expectedCode = 200,
) => {
    return app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/lifecycle/complete`,
        )
        .send(status)
        .expect(expectedCode);
};

const uncompleteFeature = async (featureName: string, expectedCode = 200) => {
    return app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/lifecycle/uncomplete`,
        )
        .expect(expectedCode);
};

function reachedStage(feature: string, stage: StageName) {
    return new Promise((resolve) =>
        eventBus.on(STAGE_ENTERED, (event) => {
            if (event.stage === stage && event.feature === feature)
                resolve(stage);
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
    await reachedStage('my_feature_a', 'initial');
    await expectFeatureStage('my_feature_a', 'initial');
    eventBus.emit(CLIENT_METRICS_ADDED, [
        {
            featureName: 'my_feature_a',
            environment: 'default',
        },
        {
            featureName: 'non_existent_feature',
            environment: 'default',
        },
    ]);

    // missing feature
    eventBus.emit(CLIENT_METRICS_ADDED, [
        {
            environment: 'default',
            yes: 0,
            no: 0,
        },
    ]);
    // non existent env
    eventBus.emit(CLIENT_METRICS_ADDED, [
        {
            featureName: 'my_feature_a',
            environment: 'non-existent',
        },
    ]);
    await reachedStage('my_feature_a', 'live');
    await expectFeatureStage('my_feature_a', 'live');
    eventStore.emit(FEATURE_ARCHIVED, { featureName: 'my_feature_a' });
    await reachedStage('my_feature_a', 'archived');

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
    await reachedStage('my_feature_a', 'initial');
});

test('should be able to toggle between completed/uncompleted', async () => {
    await app.createFeature('my_feature_b');

    await completeFeature('my_feature_b', {
        status: 'kept',
        statusValue: 'variant1',
    });
    const currentStage = await getCurrentStage('my_feature_b');
    expect(currentStage).toMatchObject({ stage: 'completed', status: 'kept' });

    await expectFeatureStage('my_feature_b', 'completed');

    await uncompleteFeature('my_feature_b');

    const { body } = await getFeatureLifecycle('my_feature_b');

    expect(body).toEqual([]);
});

test('should backfill initial stage when no stages', async () => {
    await app.createFeature('my_feature_c');

    await featureLifecycleStore.delete('my_feature_c');

    const currentStage = await getCurrentStage('my_feature_c');
    expect(currentStage).toBe(undefined);

    await featureLifecycleStore.backfill();

    const backfilledCurrentStage = await getCurrentStage('my_feature_c');
    expect(backfilledCurrentStage).toEqual({
        stage: 'initial',
        enteredStageAt: expect.any(Date),
    });
});
