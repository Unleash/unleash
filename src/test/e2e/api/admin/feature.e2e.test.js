'use strict';

const test = require('ava');
const faker = require('faker');
const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;

test.before(async () => {
    const db = await dbInit('feature_api_serial', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('returns list of feature toggles', async t => {
    const request = await setupApp(stores);
    return request
        .get('/api/admin/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.features.length === 4);
        });
});

test.serial('gets a feature by name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/features/featureX')
        .expect('Content-Type', /json/)
        .expect(200);
});

test.serial('cant get feature that dose not exist', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/features/myfeature')
        .expect('Content-Type', /json/)
        .expect(404);
});

test.serial('creates new feature toggle', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({
            name: 'com.test.feature',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test.serial('creates new feature toggle with variants', async t => {
    t.plan(0);
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

test.serial('fetch feature toggle with variants', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/features/feature.with.variants')
        .expect(res => {
            t.true(res.body.variants.length === 2);
        });
});

test.serial('creates new feature toggle with createdBy unknown', async t => {
    t.plan(1);
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
        t.is(res.body.events[0].createdBy, 'unknown');
    });
});

test.serial('require new feature toggle to have a name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({ name: '' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test.serial(
    'can not change status of feature toggle that does not exist',
    async t => {
        t.plan(0);
        const request = await setupApp(stores);
        return request
            .put('/api/admin/features/should-not-exist')
            .send({ name: 'should-not-exist', enabled: false })
            .set('Content-Type', 'application/json')
            .expect(404);
    },
);

test.serial('can change status of feature toggle that does exist', async t => {
    t.plan(0);
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

test.serial('can not toggle of feature that does not exist', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features/should-not-exist/toggle')
        .set('Content-Type', 'application/json')
        .expect(404);
});

test.serial('can toggle a feature that does exist', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features/featureY/toggle')
        .set('Content-Type', 'application/json')
        .expect(200);
});

test.serial('archives a feature by name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request.delete('/api/admin/features/featureX').expect(200);
});

test.serial('can not archive unknown feature', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request.delete('/api/admin/features/featureUnknown').expect(404);
});

test.serial('refuses to create a feature with an existing name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features')
        .send({ name: 'featureX' })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test.serial('refuses to validate a feature with an existing name', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/features/validate')
        .send({ name: 'featureX' })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test.serial(
    'new strategies api can add two strategies to a feature toggle',
    async t => {
        t.plan(0);
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
    },
);

test.serial('should not be possible to create archived toggle', async t => {
    t.plan(0);
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

test.serial('creates new feature toggle with variant overrides', async t => {
    t.plan(0);
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

test.serial('creates new feature toggle without type', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    await request.post('/api/admin/features').send({
        name: 'com.test.noType',
        enabled: false,
        strategies: [{ name: 'default' }],
    });
    await new Promise(r => setTimeout(r, 200));
    return request.get('/api/admin/features/com.test.noType').expect(res => {
        t.is(res.body.type, 'release');
    });
});

test.serial('creates new feature toggle with type', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    await request.post('/api/admin/features').send({
        name: 'com.test.withType',
        type: 'killswitch',
        enabled: false,
        strategies: [{ name: 'default' }],
    });
    await new Promise(r => setTimeout(r, 200));
    return request.get('/api/admin/features/com.test.withType').expect(res => {
        t.is(res.body.type, 'killswitch');
    });
});

test.serial('tags feature with new tag', async t => {
    t.plan(1);
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
        t.is(res.body.tags[0].value, 'TeamGreen');
    });
});

test.serial(
    'tagging a feature with an already existing tag should be a noop',
    async t => {
        t.plan(1);
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
                t.is(res.body.tags.length, 1);
            });
    },
);

test.serial('can untag feature', async t => {
    t.plan(1);
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
            t.is(res.body.tags.length, 0);
        });
});

test.serial('Can get features tagged by tag', async t => {
    t.plan(2);
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
            t.is(res.body.features.length, 1);
            t.is(res.body.features[0].name, feature1Name);
        });
});
test.serial('Can query for multiple tags using OR', async t => {
    t.plan(3);
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
            t.is(res.body.features.length, 2);
            t.true(res.body.features.some(f => f.name === feature1Name));
            t.true(res.body.features.some(f => f.name === feature2Name));
        });
});
test.serial('Querying with multiple filters ANDs the filters', async t => {
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
        .expect(res => t.is(res.body.features.length, 2));
    await request
        .get(`/api/admin/features?namePrefix=test&tag=${tag.type}:${tag.value}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.features.length, 1);
            t.is(res.body.features[0].name, feature1Name);
        });
});

test.serial(
    'Tagging a feature with a tag it already has should return 409',
    async t => {
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
                t.is(
                    res.body.details[0].message,
                    `${feature1Name} already had the tag: [${tag.type}:${tag.value}]`,
                );
            });
    },
);

test.serial('marks feature toggle as stale', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    await request
        .post('/api/admin/features/featureZ/stale/on')
        .set('Content-Type', 'application/json');

    return request.get('/api/admin/features/featureZ').expect(res => {
        t.true(res.body.stale);
    });
});
