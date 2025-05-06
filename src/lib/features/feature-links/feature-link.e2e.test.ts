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
                flags: {
                    featureLinks: true,
                },
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

const updatedLink = async (
    featureName: string,
    linkId: string,
    link: FeatureLinkSchema,
    expectedCode = 204,
) => {
    return app.request
        .put(
            `/api/admin/projects/default/features/${featureName}/link/${linkId}`,
        )
        .send(link)
        .expect(expectedCode);
};

const deleteLink = async (
    featureName: string,
    linkId: string,
    expectedCode = 204,
) => {
    return app.request
        .delete(
            `/api/admin/projects/default/features/${featureName}/link/${linkId}`,
        )
        .expect(expectedCode);
};

test('should manage feature links', async () => {
    await app.createFeature('my_feature');

    await addLink('my_feature', { url: 'example.com', title: 'feature link' });

    const links = await featureLinkStore.getAll();
    expect(links).toMatchObject([
        {
            url: 'example.com',
            title: 'feature link',
            featureName: 'my_feature',
        },
    ]);

    await updatedLink('my_feature', links[0].id, {
        url: 'example_updated.com',
        title: 'feature link updated',
    });

    const updatedLinks = await featureLinkStore.getAll();
    expect(updatedLinks).toMatchObject([
        {
            url: 'example_updated.com',
            title: 'feature link updated',
            featureName: 'my_feature',
        },
    ]);

    await deleteLink('my_feature', links[0].id);

    const deletedLinks = await featureLinkStore.getAll();
    expect(deletedLinks).toMatchObject([]);

    const [event1, event2, event3] = await eventStore.getEvents();
    expect([event1, event2, event3]).toMatchObject([
        {
            type: 'feature-link-removed',
            data: null,
            preData: {
                url: 'example_updated.com',
                title: 'feature link updated',
            },
            featureName: 'my_feature',
            project: 'default',
        },
        {
            type: 'feature-link-updated',
            data: { url: 'example_updated.com', title: 'feature link updated' },
            preData: { url: 'example.com', title: 'feature link' },
            featureName: 'my_feature',
            project: 'default',
        },
        {
            type: 'feature-link-added',
            data: { url: 'example.com', title: 'feature link' },
            preData: null,
            featureName: 'my_feature',
            project: 'default',
        },
    ]);
});
