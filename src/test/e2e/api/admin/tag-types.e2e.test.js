'use strict';

const test = require('ava');
const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;
let db;

test.before(async () => {
    db = await dbInit('tag_types_api_serial', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await db.destroy();
});

test.serial('returns list of tag-types', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/tag-types')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.tagTypes.length, 1);
        });
});

test.serial('gets a tag-type by name', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/tag-types/simple')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.tagType.name, 'simple');
        });
});

test.serial('querying a tag-type that does not exist yields 404', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request.get('/api/admin/tag-types/non-existent').expect(404);
});

test.serial('Can create a new tag type', async t => {
    const request = await setupApp(stores);
    await request.post('/api/admin/tag-types').send({
        name: 'slack',
        description:
            'Tag your feature toggles with slack channel to post updates for toggle to',
        icon:
            'http://icons.iconarchive.com/icons/papirus-team/papirus-apps/32/slack-icon.png',
    });
    return request
        .get('/api/admin/tag-types/slack')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(
                res.body.tagType.icon,
                'http://icons.iconarchive.com/icons/papirus-team/papirus-apps/32/slack-icon.png',
            );
        });
});

test.serial('Invalid tag types gets rejected', async t => {
    const request = await setupApp(stores);
    await request
        .post('/api/admin/tag-types')
        .send({
            name: 'Something url unsafe',
            description: 'A fancy description',
            icon: 'NoIcon',
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect(res => {
            t.is(res.body.details[0].message, '"name" must be URL friendly');
        });
});

test.serial('Can update a tag types description and icon', async t => {
    const request = await setupApp(stores);
    await request.get('/api/admin/tag-types/simple').expect(200);
    await request
        .put('/api/admin/tag-types/simple')
        .send({
            description: 'new description',
            icon: '$',
        })
        .expect(200);
    return request
        .get('/api/admin/tag-types/simple')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.tagType.icon, '$');
        });
});
test.serial('Invalid updates gets rejected', async t => {
    const request = await setupApp(stores);
    await request.get('/api/admin/tag-types/simple').expect(200);
    await request
        .put('/api/admin/tag-types/simple')
        .send({
            description: 15125,
            icon: 125,
        })
        .expect(400)
        .expect(res => {
            t.is(res.body.details[0].message, '"description" must be a string');
            t.is(res.body.details[1].message, '"icon" must be a string');
        });
});

test.serial(
    'Validation of tag-types returns 200 for valid tag-types',
    async t => {
        const request = await setupApp(stores);
        await request
            .post('/api/admin/tag-types/validate')
            .send({
                name: 'something',
                description: 'A fancy description',
                icon: 'NoIcon',
            })
            .set('Content-Type', 'application/json')
            .expect(200)
            .expect(res => {
                t.is(res.body.valid, true);
            });
    },
);
test.serial('Invalid tag-types get refused by validator', async t => {
    const request = await setupApp(stores);
    await request
        .post('/api/admin/tag-types/validate')
        .send({
            name: 'Something url unsafe',
            description: 'A fancy description',
            icon: 'NoIcon',
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect(res => {
            t.is(res.body.details[0].message, '"name" must be URL friendly');
        });
});

test.serial('Can delete tag type', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    await request
        .delete('/api/admin/tag-types/simple')
        .set('Content-Type', 'application/json')
        .expect(200);
    return request.get('/api/admin/tag-types/simple').expect(404);
});

test.serial('Non unique tag-types gets rejected', async t => {
    const request = await setupApp(stores);
    await request
        .post('/api/admin/tag-types')
        .send({
            name: 'my-tag-type',
            description: 'Will be accepted first time',
            icon: 'T',
        })
        .set('Content-Type', 'application/json')
        .expect(201);
    return request
        .post('/api/admin/tag-types')
        .send({
            name: 'my-tag-type',
            description: 'Will not be accepted this time',
            icon: 'T',
        })
        .set('Content-Type', 'application/json')
        .expect(res => {
            t.is(res.status, 409);
        });
});

test.serial('Only required argument should be name', async t => {
    const request = await setupApp(stores);
    const name = 'some-tag-type';
    return request
        .post('/api/admin/tag-types')
        .send({ name, description: '' })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            t.is(res.body.name, name);
        });
});
