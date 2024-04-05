import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    type IEventStore,
} from '../../types';

let app: IUnleashTest;
let db: ITestDb;
let eventStore: IEventStore;

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

function ms(timeMs) {
    return new Promise((resolve) => setTimeout(resolve, timeMs));
}

test('should return lifecycle stages', async () => {
    await eventStore.emit(FEATURE_CREATED, { featureName: 'my_feature_a' });
    await eventStore.emit(FEATURE_ARCHIVED, { featureName: 'my_feature_a' });

    const { body } = await getFeatureLifecycle('my_feature_a');

    expect(body).toEqual([
        { stage: 'initial', enteredStageAt: expect.any(String) },
        { stage: 'archived', enteredStageAt: expect.any(String) },
    ]);
});
