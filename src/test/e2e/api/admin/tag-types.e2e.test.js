'use strict';

const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('tag_types_api_serial', getLogger);
    stores = db.stores;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

test('returns list of tag-types', async () => {
    expect.assertions(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/tag-types')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tagTypes.length).toBe(1);
        });
});

test('gets a tag-type by name', async () => {
    expect.assertions(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/tag-types/simple')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tagType.name).toBe('simple');
        });
});

test('querying a tag-type that does not exist yields 404', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request.get('/api/admin/tag-types/non-existent').expect(404);
});

test('Can create a new tag type', async () => {
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
            expect(res.body.tagType.icon).toBe(
                'http://icons.iconarchive.com/icons/papirus-team/papirus-apps/32/slack-icon.png',
            );
        });
});

test('Invalid tag types gets rejected', async () => {
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
            expect(res.body.details[0].message).toBe(
                '"name" must be URL friendly',
            );
        });
});

test('Can update a tag types description and icon', async () => {
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
            expect(res.body.tagType.icon).toBe('$');
        });
});
test('Invalid updates gets rejected', async () => {
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
            expect(res.body.details[0].message).toBe(
                '"description" must be a string',
            );
            expect(res.body.details[1].message).toBe('"icon" must be a string');
        });
});

test('Validation of tag-types returns 200 for valid tag-types', async () => {
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
            expect(res.body.valid).toBe(true);
        });
});
test('Invalid tag-types get refused by validator', async () => {
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
            expect(res.body.details[0].message).toBe(
                '"name" must be URL friendly',
            );
        });
});

test('Can delete tag type', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    await request
        .delete('/api/admin/tag-types/simple')
        .set('Content-Type', 'application/json')
        .expect(200);
    return request.get('/api/admin/tag-types/simple').expect(404);
});

test('Non unique tag-types gets rejected', async () => {
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
            expect(res.status).toBe(409);
        });
});

test('Only required argument should be name', async () => {
    const request = await setupApp(stores);
    const name = 'some-tag-type';
    return request
        .post('/api/admin/tag-types')
        .send({ name, description: '' })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.name).toBe(name);
        });
});
