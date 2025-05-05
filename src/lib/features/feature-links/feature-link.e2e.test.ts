import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper';
import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import type { IEventStore, IFeatureLinkStore } from '../../types';
import getLogger from '../../../test/fixtures/no-logger';
import type { FeatureLinkSchema } from '../../openapi/spec/feature-link-schema';

let app: IUnleashTest;
let db: ITestDb;
let featureLinkStore: IFeatureLinkStore;
let eventStore: IEventStore;

beforeAll(async () => {
    db = await dbInit('feature_link', getLogger, {
        dbInitMethod: 'legacy' as const,
    });
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
    featureLinkStore = db.stores.featureLinkStore;

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
    await featureLinkStore.deleteAll();
});

const addLink = async (
    featureName: string,
    link: FeatureLinkSchema,
    expectedCode = 204,
) => {
    return app.request
        .post(`/api/admin/projects/default/features/${featureName}/link`)
        .send(link)
        .expect(expectedCode);
};

test('should add feature links', async () => {
    await app.createFeature('my_feature');

    await addLink('my_feature', { url: 'example.com', title: 'feature link' });
});
