'use strict';

const test = require('ava');
const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;

test.before(async () => {
    const db = await dbInit('tag_api_serial', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('returns list of tags', async t => {
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
            t.is(res.body.tags.length, 1);
        });
});

test.serial('gets a tag by type and value', async t => {
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
            t.is(res.body.tag.value, 'Tester');
        });
});

test.serial('cannot get tag that does not exist', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    return request.get('/api/admin/tags/simple/12158091').expect(res => {
        t.is(res.status, 404);
    });
});

test.serial('Can create a tag', async t => {
    const request = await setupApp(stores);
    return request
        .post('/api/admin/tags')
        .send({
            id: 1,
            value: 'TeamRed',
            type: 'simple',
        })
        .expect(res => {
            t.is(res.status, 201);
        });
});
test.serial('Can validate a tag', async t => {
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
            t.is(res.body.details.length, 2);
            t.is(res.body.details[0].message, '"value" must be a string');
            t.is(res.body.details[1].message, '"type" must be URL friendly');
        });
});
test.serial('Can delete a tag', async t => {
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
            t.is(
                res.body.tags.indexOf(
                    tag => tag.value === 'Tester' && tag.type === 'simple',
                ),
                -1,
            );
        });
});
