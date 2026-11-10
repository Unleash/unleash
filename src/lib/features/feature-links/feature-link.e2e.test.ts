import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    type IEventStore,
    type IFeatureLinkStore,
    TEST_AUDIT_USER,
} from '../../types/index.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import type { LinkSchema } from '../../openapi/spec/link-schema.js';
import type { IFeatureLinksReadModel } from './feature-links-read-model-type.js';
import { FeatureLinksReadModel } from './feature-links-read-model.js';

let app: IUnleashTest;
let db: ITestDb;
let featureLinkStore: IFeatureLinkStore;
let eventStore: IEventStore;
let featureLinkReadModel: IFeatureLinksReadModel;

beforeAll(async () => {
    db = await dbInit('feature_link', getLogger);
    app = await setupAppWithAuth(db.stores, {}, db.rawDatabase);
    eventStore = db.stores.eventStore;
    featureLinkStore = db.stores.featureLinkStore;
    featureLinkReadModel = new FeatureLinksReadModel(
        db.rawDatabase,
        app.config.eventBus,
    );

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
    link: LinkSchema,
    expectedCode = 204,
    projectId = 'default',
) => {
    return app.request
        .post(`/api/admin/projects/${projectId}/features/${featureName}/link`)
        .send(link)
        .expect(expectedCode);
};

const updateLink = async (
    featureName: string,
    linkId: string,
    link: LinkSchema,
    expectedCode = 204,
    projectId = 'default',
) => {
    return app.request
        .put(
            `/api/admin/projects/${projectId}/features/${featureName}/link/${linkId}`,
        )
        .send(link)
        .expect(expectedCode);
};

const deleteLink = async (
    featureName: string,
    linkId: string,
    expectedCode = 204,
    projectId = 'default',
) => {
    return app.request
        .delete(
            `/api/admin/projects/${projectId}/features/${featureName}/link/${linkId}`,
        )
        .expect(expectedCode);
};

test('should manage feature links', async () => {
    await app.createFeature('my_feature');

    await addLink('my_feature', { url: 'example.com', title: 'feature link' });
    await addLink('my_feature', {
        url: 'example_another.com',
        title: 'another feature link',
    });

    const links = await featureLinkStore.getAll();
    expect(links).toMatchObject([
        {
            url: 'https://example.com',
            title: 'feature link',
            featureName: 'my_feature',
            domain: 'example',
        },
        {
            url: 'https://example_another.com',
            title: 'another feature link',
            featureName: 'my_feature',
            domain: 'example_another',
        },
    ]);
    const topDomains = await featureLinkReadModel.getTopDomains();
    expect(topDomains).toMatchObject([
        { domain: 'example_another', count: 1 },
        { domain: 'example', count: 1 },
    ]);
    const { body } = await app.getProjectFeatures('default', 'my_feature');
    expect(body.links).toMatchObject([
        { id: links[0].id, title: 'feature link', url: 'https://example.com' },
        {
            id: links[1].id,
            title: 'another feature link',
            url: 'https://example_another.com',
        },
    ]);

    await updateLink('my_feature', links[0].id, {
        url: 'example_updated.com',
        title: 'feature link updated',
    });

    const updatedLink = await featureLinkStore.get(links[0].id);
    expect(updatedLink).toMatchObject({
        url: 'https://example_updated.com',
        title: 'feature link updated',
        featureName: 'my_feature',
        domain: 'example_updated',
    });

    await deleteLink('my_feature', links[0].id);

    const deletedLinks = await featureLinkStore.getAll();
    expect(deletedLinks).toMatchObject([
        {
            id: links[1].id,
            title: 'another feature link',
            url: 'https://example_another.com',
            domain: 'example_another',
        },
    ]);
    const topDomainsMemoized = await featureLinkReadModel.getTopDomains();
    expect(topDomainsMemoized).toMatchObject([
        { domain: 'example_another', count: 1 },
        { domain: 'example', count: 1 },
    ]);

    const [event1, event2, event3] = await eventStore.getEvents();
    expect([event1, event2, event3]).toMatchObject([
        {
            type: 'feature-link-removed',
            data: null,
            preData: {
                url: 'https://example_updated.com',
                title: 'feature link updated',
            },
            featureName: 'my_feature',
            project: 'default',
        },
        {
            type: 'feature-link-updated',
            data: {
                url: 'https://example_updated.com',
                title: 'feature link updated',
            },
            preData: { url: 'https://example.com', title: 'feature link' },
            featureName: 'my_feature',
            project: 'default',
        },
        {
            type: 'feature-link-added',
            data: {
                url: 'https://example_another.com',
                title: 'another feature link',
            },
            preData: null,
            featureName: 'my_feature',
            project: 'default',
        },
    ]);
});

test('cannot manage feature links via a different project', async () => {
    const featureName = 'feature-in-default';
    await app.createFeature(featureName);

    const otherProject = 'other-project';
    const user = await db.stores.userStore.getByQuery({
        email: 'user@getunleash.io',
    });

    await app.services.projectService.createProject(
        {
            id: otherProject,
            name: 'Other Project',
            mode: 'open',
            defaultStickiness: 'clientId',
        },
        user,
        TEST_AUDIT_USER,
    );

    // Create must target the feature's own project
    await addLink(
        featureName,
        { url: 'example.com', title: 'abuse attempt' },
        404,
        otherProject,
    );
    expect(await featureLinkStore.getAll()).toEqual([]);

    await addLink(featureName, { url: 'example.com', title: 'real link' });
    const [link] = await featureLinkStore.getAll();

    // Update via a project the user can access, but that does not own the feature
    await updateLink(
        featureName,
        link.id,
        { url: 'evil.com', title: 'hijacked' },
        404,
        otherProject,
    );
    expect(await featureLinkStore.get(link.id)).toMatchObject({
        url: 'https://example.com',
        title: 'real link',
    });

    // Same for delete
    await deleteLink(featureName, link.id, 404, otherProject);
    expect(await featureLinkStore.getAll()).toMatchObject([
        { id: link.id, url: 'https://example.com', title: 'real link' },
    ]);
});
