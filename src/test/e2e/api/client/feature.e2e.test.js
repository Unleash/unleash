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
        {
            name: 'featureX',
            description: 'the #1 feature',
            enabled: true,
            strategies: [
                {
                    name: 'default',
                    parameters: {},
                },
            ],
        },
        'test',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle({
        name: 'featureY',
        description: 'soon to be the #1 feature',
        enabled: false,
        strategies: [
            {
                name: 'baz',
                parameters: {
                    foo: 'bar',
                },
            },
        ],
    });
    await app.services.featureToggleServiceV2.createFeatureToggle(
        {
            name: 'featureZ',
            description: 'terrible feature',
            enabled: true,
            strategies: [
                {
                    name: 'baz',
                    parameters: {
                        foo: 'rab',
                    },
                },
            ],
        },
        'test',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle(
        {
            name: 'featureArchivedX',
            description: 'the #1 feature',
            enabled: true,
            archived: true,
            strategies: [
                {
                    name: 'default',
                    parameters: {},
                },
            ],
        },
        'test',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle(
        {
            name: 'featureArchivedY',
            description: 'soon to be the #1 feature',
            enabled: false,
            archived: true,
            strategies: [
                {
                    name: 'baz',
                    parameters: {
                        foo: 'bar',
                    },
                },
            ],
        },
        'test',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle(
        {
            name: 'featureArchivedZ',
            description: 'terrible feature',
            enabled: true,
            archived: true,
            strategies: [
                {
                    name: 'baz',
                    parameters: {
                        foo: 'rab',
                    },
                },
            ],
        },
        'test',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle(
        {
            name: 'feature.with.variants',
            description: 'A feature toggle with variants',
            enabled: true,
            archived: false,
            strategies: [{ name: 'default' }],
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
        .expect(res => {
            expect(res.body.features.length).toBe(4);
        }));

test('returns four feature toggles without createdAt', async () =>
    app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
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
        .expect(res => {
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
        .expect(res => expect(res.body.features.length).toBe(2));
    await app.request
        .get('/api/client/features?namePrefix=test&tag=simple:Crazy')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length).toBe(1);
            expect(res.body.features[0].name).toBe('test.feature');
        });
});
