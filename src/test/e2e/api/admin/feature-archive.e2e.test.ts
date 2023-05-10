import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { DEFAULT_PROJECT } from '../../../../lib/types';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('archive_serial', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    });
    await app.createFeature({
        name: 'featureX',
        description: 'the #1 feature',
    });
    await app.createFeature({
        name: 'featureY',
        description: 'soon to be the #1 feature',
    });
    await app.createFeature({
        name: 'featureZ',
        description: 'terrible feature',
    });
    await app.createFeature({
        name: 'featureArchivedX',
        description: 'the #1 feature',
    });
    await app.archiveFeature('featureArchivedX');

    await app.createFeature({
        name: 'featureArchivedY',
        description: 'soon to be the #1 feature',
    });
    await app.archiveFeature('featureArchivedY');
    await app.createFeature({
        name: 'featureArchivedZ',
        description: 'terrible feature',
    });
    await app.archiveFeature('featureArchivedZ');
    await app.createFeature({
        name: 'feature.with.variants',
        description: 'A feature toggle with variants',
        variants: [
            { name: 'control', weight: 50 },
            { name: 'new', weight: 50 },
        ],
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns three archived toggles', async () => {
    expect.assertions(1);
    return app.request
        .get('/api/admin/archive/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features.length === 3).toBe(true);
        });
});

test('returns three archived toggles with archivedAt', async () => {
    expect.assertions(3);
    return app.request
        .get('/api/admin/archive/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features.length).toEqual(3);
            expect(res.body.features.every((f) => f.archived)).toEqual(true);
            expect(res.body.features.every((f) => f.archivedAt)).toEqual(true);
        });
});

test('revives a feature by name', async () => {
    return app.request
        .post('/api/admin/archive/revive/featureArchivedX')
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('archived feature is not accessible via /features/:featureName', async () => {
    expect.assertions(0);

    await app.getFeatures('featureArchivedZ', 404);
    await app.getProjectFeatures('default', 'featureArchivedZ', 404);
});

test('must set name when reviving toggle', async () => {
    expect.assertions(0);
    return app.request.post('/api/admin/archive/revive/').expect(404);
});

test('should be allowed to reuse deleted toggle name', async () => {
    expect.assertions(2);
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'really.delete.feature',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.name).toBe('really.delete.feature');
            expect(res.body.createdAt).toBeTruthy();
        });
    await app.request
        .delete('/api/admin/projects/default/features/really.delete.feature')
        .expect(202);
    await app.request
        .delete('/api/admin/archive/really.delete.feature')
        .expect(200);
    return app.request
        .post('/api/admin/features/validate')
        .send({ name: 'really.delete.feature' })
        .set('Content-Type', 'application/json')
        .expect(200);
});
test('Deleting an unarchived toggle should not take effect', async () => {
    expect.assertions(2);
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'really.delete.feature',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.name).toBe('really.delete.feature');
            expect(res.body.createdAt).toBeTruthy();
        });
    await app.request
        .delete('/api/admin/archive/really.delete.feature')
        .expect(200);
    return app.request
        .post('/api/admin/features/validate')
        .send({ name: 'really.delete.feature' })
        .set('Content-Type', 'application/json')
        .expect(409); // because it still exists
});

test('can bulk delete features and recreate after', async () => {
    const features = ['first.bulk.issue', 'second.bulk.issue'];
    for (const feature of features) {
        await app.request
            .post('/api/admin/projects/default/features')
            .send({
                name: feature,
                enabled: false,
                strategies: [{ name: 'default' }],
            })
            .set('Content-Type', 'application/json')
            .expect(201);
    }
    await app.request
        .post(`/api/admin/projects/${DEFAULT_PROJECT}/archive`)
        .send({
            features,
        })
        .expect(202);
    await app.request
        .post('/api/admin/projects/default/delete')
        .send({ features })
        .expect(200);
    for (const feature of features) {
        await app.request
            .post('/api/admin/features/validate')
            .send({ name: feature })
            .set('Content-Type', 'application/json')
            .expect(200);
    }
});

test('can bulk revive features', async () => {
    const features = ['first.revive.issue', 'second.revive.issue'];
    for (const feature of features) {
        await app.request
            .post('/api/admin/projects/default/features')
            .send({
                name: feature,
                enabled: false,
                strategies: [{ name: 'default' }],
            })
            .set('Content-Type', 'application/json')
            .expect(201);
    }
    await app.request
        .post(`/api/admin/projects/${DEFAULT_PROJECT}/archive`)
        .send({
            features,
        })
        .expect(202);
    await app.request
        .post('/api/admin/projects/default/revive')
        .send({ features })
        .expect(200);
    for (const feature of features) {
        await app.request
            .get(`/api/admin/projects/default/features/${feature}`)
            .expect(200);
    }
});

test('Should be able to bulk archive features', async () => {
    const featureName1 = 'archivedFeature1';
    const featureName2 = 'archivedFeature2';

    await app.createFeature(featureName1);
    await app.createFeature(featureName2);

    await app.request
        .post(`/api/admin/projects/${DEFAULT_PROJECT}/archive`)
        .send({
            features: [featureName1, featureName2],
        })
        .expect(202);

    const { body } = await app.request
        .get(`/api/admin/archive/features/${DEFAULT_PROJECT}`)
        .expect(200);

    const archivedFeatures = body.features.filter(
        (feature) =>
            feature.name === featureName1 || feature.name === featureName2,
    );
    expect(archivedFeatures).toHaveLength(2);
});
