'use strict';

import test from 'ava';
import { setupApp } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { IApiToken } from '../../../../lib/db/api-token-store';

let stores;
let db;

test.before(async () => {
    db = await dbInit('token_api_serial', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await db.destroy();
});

test.afterEach(async () => {
    const tokens = await stores.apiTokenStore.getAll();
    const deleteAll = tokens.map((t: IApiToken) =>
        stores.apiTokenStore.delete(t.secret),
    );
    await Promise.all(deleteAll);
});

test.serial('returns empty list of tokens', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.length === 0);
        });
});

test.serial('creates new client token', async t => {
    t.plan(4);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-client',
            type: 'client',
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            t.is(res.body.username, 'default-client');
            t.is(res.body.type, 'client');
            t.truthy(res.body.createdAt);
            t.true(res.body.secret.length > 16);
        });
});

test.serial('creates new admin token', async t => {
    t.plan(4);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-admin',
            type: 'admin',
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            t.is(res.body.username, 'default-admin');
            t.is(res.body.type, 'admin');
            t.truthy(res.body.createdAt);
            t.true(res.body.secret.length > 16);
        });
});

test.serial('creates a lot of client tokens', async t => {
    t.plan(4);
    const request = await setupApp(stores);

    const requests = [];

    for (let i = 0; i < 10; i++) {
        requests.push(
            request
                .post('/api/admin/api-tokens')
                .send({
                    username: 'default-client',
                    type: 'client',
                })
                .set('Content-Type', 'application/json')
                .expect(201),
        );
    }
    await Promise.all(requests);
    t.plan(2);
    return request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.length, 10);
            t.is(res.body[2].type, 'client');
        });
});
