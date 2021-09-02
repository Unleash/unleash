'use strict';

const { setupApp } = require('../../helpers/test-helper');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let app;
let db;

beforeAll(async () => {
    db = await dbInit('feature_api_client', getLogger);
    app = await setupApp(db.stores);
    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        {
            name: 'featureX',
            description: 'the #1 feature',
        },
        'test',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle('default', {
        name: 'featureY',
        description: 'soon to be the #1 feature',
    });
    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        {
            name: 'featureZ',
            description: 'terrible feature',
        },
        'test',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        {
            name: 'featureArchivedX',
            description: 'the #1 feature',
        },
        'test',
    );
    await app.services.featureToggleServiceV2.archiveToggle(
        'featureArchivedX',
        'test',
    );

    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        {
            name: 'featureArchivedY',
            description: 'soon to be the #1 feature',
        },
        'test',
    );
    await app.services.featureToggleServiceV2.archiveToggle(
        'featureArchivedY',
        'test',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        {
            name: 'featureArchivedZ',
            description: 'terrible feature',
        },
        'test',
    );
    await app.services.featureToggleServiceV2.archiveToggle(
        'featureArchivedZ',
        'test',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        {
            name: 'feature.with.variants',
            description: 'A feature toggle with variants',
            variants: [
                { name: 'control', weight: 50 },
                { name: 'new', weight: 50 },
            ],
        },
        'test',
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns four feature toggles', async () =>
    app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features.length).toBe(4);
        }));

test('returns four feature toggles without createdAt', async () =>
    app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features[0].createdAt).toBeFalsy();
        }));

test('gets a feature by name', async () => {
    expect.assertions(0);

    return app.request
        .get('/api/client/features/featureX')
        .expect('Content-Type', /json/)
        .expect(200);
});

test('cant get feature that does not exist', async () => {
    expect.assertions(0);

    return app.request
        .get('/api/client/features/myfeature')
        .expect('Content-Type', /json/)
        .expect(404);
});

test('Can filter features by namePrefix', async () => {
    expect.assertions(2);

    return app.request
        .get('/api/client/features?namePrefix=feature.')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features.length).toBe(1);
            expect(res.body.features[0].name).toBe('feature.with.variants');
        });
});

test('Can use multiple filters', async () => {
    expect.assertions(3);

    await app.request.post('/api/admin/features').send({
        name: 'test.feature',
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await app.request.post('/api/admin/features').send({
        name: 'test.feature2',
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await app.request.post('/api/admin/features').send({
        name: 'notestprefix.feature3',
        type: 'release',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    const tag = { value: 'Crazy', type: 'simple' };
    const tag2 = { value: 'tagb', type: 'simple' };
    await app.request
        .post('/api/admin/features/test.feature/tags')
        .send(tag)
        .expect(201);
    await app.request
        .post('/api/admin/features/test.feature2/tags')
        .send(tag2)
        .expect(201);
    await app.request
        .post('/api/admin/features/notestprefix.feature3/tags')
        .send(tag)
        .expect(201);
    await app.request
        .get('/api/client/features?tag=simple:Crazy')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.features.length).toBe(2));
    await app.request
        .get('/api/client/features?namePrefix=test&tag=simple:Crazy')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features.length).toBe(1);
            expect(res.body.features[0].name).toBe('test.feature');
        });
});
