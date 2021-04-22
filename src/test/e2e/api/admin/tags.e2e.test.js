'use strict';;
const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('tag_api_serial', getLogger);
    stores = db.stores;
});

test(async () => {
    await db.destroy();
});

test('returns list of tags', async () => {
    const request = await setupApp(stores);
    request
        .post('/api/admin/tags')
        .send({
            value: 'Tester',
            type: 'simple',
        })
        .set('Content-Type', 'application/json');

    return request
        .get('/api/admin/tags')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tags.length).toBe(1);
        });
});

test('gets a tag by type and value', async () => {
    const request = await setupApp(stores);
    request
        .post('/api/admin/tags')
        .send({
            value: 'Tester',
            type: 'simple',
        })
        .set('Content-Type', 'application/json');
    return request
        .get('/api/admin/tags/simple/Tester')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tag.value).toBe('Tester');
        });
});

test('cannot get tag that does not exist', async () => {
    expect.assertions(1);
    const request = await setupApp(stores);
    return request.get('/api/admin/tags/simple/12158091').expect(res => {
        expect(res.status).toBe(404);
    });
});

test('Can create a tag', async () => {
    const request = await setupApp(stores);
    return request
        .post('/api/admin/tags')
        .send({
            id: 1,
            value: 'TeamRed',
            type: 'simple',
        })
        .expect(res => {
            expect(res.status).toBe(201);
        });
});
test('Can validate a tag', async () => {
    const request = await setupApp(stores);
    return request
        .post('/api/admin/tags')
        .send({
            value: 124,
            type: 'not url friendly',
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .expect(res => {
            expect(res.body.details.length).toBe(2);
            expect(res.body.details[0].message).toBe('"value" must be a string');
            expect(res.body.details[1].message).toBe('"type" must be URL friendly');
        });
});
test('Can delete a tag', async () => {
    const request = await setupApp(stores);
    await request
        .delete('/api/admin/tags/simple/Tester')
        .set('Content-Type', 'application/json')
        .expect(200);
    await new Promise(r => setTimeout(r, 50));
    return request
        .get('/api/admin/tags')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tags.indexOf(
                tag => tag.value === 'Tester' && tag.type === 'simple',
            )).toBe(-1);
        });
});
