'use strict';;
const faker = require('faker');
const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('feature_api_serial', getLogger);
    stores = db.stores;
});

test(async () => {
    await db.destroy();
});

test('returns list of feature toggles', async () => {
    const request = await setupApp(stores);
    return request
        .get('/api/admin/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length === 4).toBe(true);
        });
});

test('gets a feature by name', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/features/featureX')
        .expect('Content-Type', /json/)
        .expect(200);
});

test('cant get feature that dose not exist', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/features/myfeature')
        .expect('Content-Type', /json/)
        .expect(404);
});

test('creates new feature toggle', async () => {
    expect.assertions(3);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({
            name: 'com.test.feature',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.name).toBe('com.test.feature');
            expect(res.body.enabled).toBe(false);
            expect(res.body.createdAt).toBeTruthy();
        });
});

test('creates new feature toggle with variants', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({
            name: 'com.test.variants',
            enabled: false,
            strategies: [{ name: 'default' }],
            variants: [
                { name: 'variant1', weight: 50 },
                { name: 'variant2', weight: 50 },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('fetch feature toggle with variants', async () => {
    expect.assertions(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/features/feature.with.variants')
        .expect(res => {
            expect(res.body.variants.length === 2).toBe(true);
        });
});

test('creates new feature toggle with createdBy unknown', async () => {
    expect.assertions(1);
    const request = await setupApp(stores);
    await request
        .post('/api/admin/features')
        .send({
            name: 'com.test.Username',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .expect(201);
    await request.get('/api/admin/events').expect(res => {
        expect(res.body.events[0].createdBy).toBe('unknown');
    });
});

test('require new feature toggle to have a name', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({ name: '' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test(
    'can not change status of feature toggle that does not exist',
    async () => {
        expect.assertions(0);
        const request = await setupApp(stores);
        return request
            .put('/api/admin/features/should-not-exist')
            .send({ name: 'should-not-exist', enabled: false })
            .set('Content-Type', 'application/json')
            .expect(404);
    }
);

test('can change status of feature toggle that does exist', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .put('/api/admin/features/featureY')
        .send({
            name: 'featureY',
            enabled: true,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('can not toggle of feature that does not exist', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features/should-not-exist/toggle')
        .set('Content-Type', 'application/json')
        .expect(404);
});

test('can toggle a feature that does exist', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features/featureY/toggle')
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('archives a feature by name', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request.delete('/api/admin/features/featureX').expect(200);
});

test('can not archive unknown feature', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request.delete('/api/admin/features/featureUnknown').expect(404);
});

test('refuses to create a feature with an existing name', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({ name: 'featureX' })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test('refuses to validate a feature with an existing name', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features/validate')
        .send({ name: 'featureX' })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test(
    'new strategies api can add two strategies to a feature toggle',
    async () => {
        expect.assertions(0);
        const request = await setupApp(stores);
        return request
            .put('/api/admin/features/featureY')
            .send({
                name: 'featureY',
                description: 'soon to be the #14 feature',
                enabled: false,
                strategies: [
                    {
                        name: 'baz',
                        parameters: { foo: 'bar' },
                    },
                ],
            })
            .set('Content-Type', 'application/json')
            .expect(200);
    }
);

test('should not be possible to create archived toggle', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({
            name: 'featureArchivedX',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test('creates new feature toggle with variant overrides', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({
            name: 'com.test.variants.overrieds',
            enabled: false,
            strategies: [{ name: 'default' }],
            variants: [
                {
                    name: 'variant1',
                    weight: 50,
                    overrides: [
                        {
                            contextName: 'userId',
                            values: ['123'],
                        },
                    ],
                },
                { name: 'variant2', weight: 50 },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('creates new feature toggle without type', async () => {
    expect.assertions(1);
    const request = await setupApp(stores);
    await request.post('/api/admin/features').send({
        name: 'com.test.noType',
        enabled: false,
        strategies: [{ name: 'default' }],
    });
    await new Promise(r => setTimeout(r, 200));
    return request.get('/api/admin/features/com.test.noType').expect(res => {
        expect(res.body.type).toBe('release');
    });
});

test('creates new feature toggle with type', async () => {
    expect.assertions(1);
    const request = await setupApp(stores);
    await request.post('/api/admin/features').send({
        name: 'com.test.withType',
        type: 'killswitch',
        enabled: false,
        strategies: [{ name: 'default' }],
    });
    await new Promise(r => setTimeout(r, 200));
    return request.get('/api/admin/features/com.test.withType').expect(res => {
        expect(res.body.type).toBe('killswitch');
    });
});

test('tags feature with new tag', async () => {
    expect.assertions(1);
    const request = await setupApp(stores);
    await request.post('/api/admin/features').send({
        name: 'test.feature',
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await request
        .post('/api/admin/features/test.feature/tags')
        .send({
            value: 'TeamGreen',
            type: 'simple',
        })
        .set('Content-Type', 'application/json');
    await new Promise(r => setTimeout(r, 200));
    return request.get('/api/admin/features/test.feature/tags').expect(res => {
        expect(res.body.tags[0].value).toBe('TeamGreen');
    });
});

test(
    'tagging a feature with an already existing tag should be a noop',
    async () => {
        expect.assertions(1);
        const request = await setupApp(stores);
        await request.post('/api/admin/features').send({
            name: 'test.feature',
            type: 'killswitch',
            enabled: true,
            strategies: [{ name: 'default' }],
        });
        await request.post('/api/admin/features/test.feature/tags').send({
            value: 'TeamGreen',
            type: 'simple',
        });
        await request.post('/api/admin/features/test.feature/tags').send({
            value: 'TeamGreen',
            type: 'simple',
        });
        await new Promise(r => setTimeout(r, 200));
        return request
            .get('/api/admin/features/test.feature/tags')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(res => {
                expect(res.body.tags.length).toBe(1);
            });
    }
);

test('can untag feature', async () => {
    expect.assertions(1);
    const request = await setupApp(stores);
    const feature1Name = faker.lorem.slug(3);
    await request.post('/api/admin/features').send({
        name: feature1Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    const tag = {
        value: faker.lorem.slug(1),
        type: 'simple',
    };
    await request
        .post(`/api/admin/features/${feature1Name}/tags`)
        .send(tag)
        .expect(201);
    await request
        .delete(
            `/api/admin/features/${feature1Name}/tags/${tag.type}/${tag.value}`,
        )
        .expect(200);
    return request
        .get(`/api/admin/features/${feature1Name}/tags`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tags.length).toBe(0);
        });
});

test('Can get features tagged by tag', async () => {
    expect.assertions(2);
    const request = await setupApp(stores);
    const feature1Name = faker.helpers.slugify(faker.lorem.words(3));
    const feature2Name = faker.helpers.slugify(faker.lorem.words(3));
    await request.post('/api/admin/features').send({
        name: feature1Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await request.post('/api/admin/features').send({
        name: feature2Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    const tag = { value: faker.lorem.word(), type: 'simple' };
    await request
        .post(`/api/admin/features/${feature1Name}/tags`)
        .send(tag)
        .expect(201);
    return request
        .get(`/api/admin/features?tag=${tag.type}:${tag.value}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length).toBe(1);
            expect(res.body.features[0].name).toBe(feature1Name);
        });
});
test('Can query for multiple tags using OR', async () => {
    expect.assertions(3);
    const request = await setupApp(stores);
    const feature1Name = faker.helpers.slugify(faker.lorem.words(3));
    const feature2Name = faker.helpers.slugify(faker.lorem.words(3));
    await request.post('/api/admin/features').send({
        name: feature1Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await request.post('/api/admin/features').send({
        name: feature2Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    const tag = { value: faker.name.firstName(), type: 'simple' };
    const tag2 = { value: faker.name.firstName(), type: 'simple' };
    await request
        .post(`/api/admin/features/${feature1Name}/tags`)
        .send(tag)
        .expect(201);
    await request
        .post(`/api/admin/features/${feature2Name}/tags`)
        .send(tag2)
        .expect(201);
    return request
        .get(
            `/api/admin/features?tag[]=${tag.type}:${tag.value}&tag[]=${tag2.type}:${tag2.value}`,
        )
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length).toBe(2);
            expect(res.body.features.some(f => f.name === feature1Name)).toBe(true);
            expect(res.body.features.some(f => f.name === feature2Name)).toBe(true);
        });
});
test('Querying with multiple filters ANDs the filters', async () => {
    const request = await setupApp(stores);
    const feature1Name = `test.${faker.helpers.slugify(faker.hacker.phrase())}`;
    const feature2Name = faker.helpers.slugify(faker.lorem.words());

    await request.post('/api/admin/features').send({
        name: feature1Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await request.post('/api/admin/features').send({
        name: feature2Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await request.post('/api/admin/features').send({
        name: 'notestprefix.feature3',
        type: 'release',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    const tag = { value: faker.lorem.word(), type: 'simple' };
    const tag2 = { value: faker.name.firstName(), type: 'simple' };
    await request
        .post(`/api/admin/features/${feature1Name}/tags`)
        .send(tag)
        .expect(201);
    await request
        .post(`/api/admin/features/${feature2Name}/tags`)
        .send(tag2)
        .expect(201);
    await request
        .post('/api/admin/features/notestprefix.feature3/tags')
        .send(tag)
        .expect(201);
    await request
        .get(`/api/admin/features?tag=${tag.type}:${tag.value}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => expect(res.body.features.length).toBe(2));
    await request
        .get(`/api/admin/features?namePrefix=test&tag=${tag.type}:${tag.value}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length).toBe(1);
            expect(res.body.features[0].name).toBe(feature1Name);
        });
});

test(
    'Tagging a feature with a tag it already has should return 409',
    async () => {
        const request = await setupApp(stores);
        const feature1Name = `test.${faker.helpers.slugify(
            faker.lorem.words(3),
        )}`;
        await request.post('/api/admin/features').send({
            name: feature1Name,
            type: 'killswitch',
            enabled: true,
            strategies: [{ name: 'default' }],
        });

        const tag = { value: faker.lorem.word(), type: 'simple' };
        await request
            .post(`/api/admin/features/${feature1Name}/tags`)
            .send(tag)
            .expect(201);
        return request
            .post(`/api/admin/features/${feature1Name}/tags`)
            .send(tag)
            .expect(409)
            .expect(res => {
                expect(res.body.details[0].message).toBe(`${feature1Name} already had the tag: [${tag.type}:${tag.value}]`);
            });
    }
);

test('marks feature toggle as stale', async () => {
    expect.assertions(1);
    const request = await setupApp(stores);
    await request
        .post('/api/admin/features/featureZ/stale/on')
        .set('Content-Type', 'application/json');

    return request.get('/api/admin/features/featureZ').expect(res => {
        expect(res.body.stale).toBe(true);
    });
});
