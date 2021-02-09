'use strict';

const test = require('ava');
const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const permissions = require('../../../test/fixtures/permissions');
const getLogger = require('../../../test/fixtures/no-logger');
const getApp = require('../../app');
const { createServices } = require('../../services');
const {
    DELETE_STRATEGY,
    CREATE_STRATEGY,
    UPDATE_STRATEGY,
} = require('../../permissions');

const eventBus = new EventEmitter();

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const perms = permissions();
    const stores = store.createStores();
    const config = {
        baseUriPath: base,
        stores,
        eventBus,
        getLogger,
        extendedPermissions: true,
        preRouterHook: perms.hook,
    };
    const services = createServices(stores, config);
    const app = getApp(config, services);

    return {
        base,
        strategyStore: stores.strategyStore,
        request: supertest(app),
        perms,
    };
}

test.afterEach(() => {
    getLogger.setMuteError(false);
});

test('add version numbers for /stategies', t => {
    t.plan(1);
    const { request, base } = getSetup();

    return request
        .get(`${base}/api/admin/strategies`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.true(res.body.version === 1);
        });
});

test('require a name when creating a new stratey', t => {
    t.plan(1);
    const { request, base, perms } = getSetup();
    perms.withPermissions(CREATE_STRATEGY);

    return request
        .post(`${base}/api/admin/strategies`)
        .send({})
        .expect(400)
        .expect(res => {
            t.true(res.body.details[0].message === '"name" is required');
        });
});

test('require parameters array when creating a new stratey', t => {
    t.plan(1);
    const { request, base, perms } = getSetup();
    perms.withPermissions(CREATE_STRATEGY);

    return request
        .post(`${base}/api/admin/strategies`)
        .send({ name: 'TestStrat' })
        .expect(400)
        .expect(res => {
            t.deepEqual(
                res.body.details[0].message,
                '"parameters" is required',
            );
        });
});

test('create a new stratey with empty parameters', t => {
    t.plan(0);
    const { request, base, perms } = getSetup();
    perms.withPermissions(CREATE_STRATEGY);

    return request
        .post(`${base}/api/admin/strategies`)
        .send({ name: 'TestStrat', parameters: [] })
        .expect(201);
});

test('not be possible to override name', t => {
    t.plan(0);
    const { request, base, strategyStore, perms } = getSetup();
    perms.withPermissions(CREATE_STRATEGY);
    strategyStore.createStrategy({ name: 'Testing', parameters: [] });

    return request
        .post(`${base}/api/admin/strategies`)
        .send({ name: 'Testing', parameters: [] })
        .expect(409);
});

test('update strategy', t => {
    t.plan(0);
    const name = 'AnotherStrat';
    const { request, base, strategyStore, perms } = getSetup();
    perms.withPermissions(UPDATE_STRATEGY);
    strategyStore.createStrategy({ name, parameters: [] });

    return request
        .put(`${base}/api/admin/strategies/${name}`)
        .send({ name, parameters: [], description: 'added' })
        .expect(200);
});

test('not update unknown strategy', t => {
    t.plan(0);
    const name = 'UnknownStrat';
    const { request, base, perms } = getSetup();
    perms.withPermissions(UPDATE_STRATEGY);

    return request
        .put(`${base}/api/admin/strategies/${name}`)
        .send({ name, parameters: [], description: 'added' })
        .expect(404);
});

test('validate format when updating strategy', t => {
    t.plan(0);
    const name = 'AnotherStrat';
    const { request, base, strategyStore, perms } = getSetup();
    perms.withPermissions(UPDATE_STRATEGY);
    strategyStore.createStrategy({ name, parameters: [] });

    return request
        .put(`${base}/api/admin/strategies/${name}`)
        .send({})
        .expect(400);
});

test('editable=false will stop delete request', t => {
    getLogger.setMuteError(true);
    t.plan(0);
    const name = 'default';
    const { request, base, perms } = getSetup();
    perms.withPermissions(DELETE_STRATEGY);

    return request.delete(`${base}/api/admin/strategies/${name}`).expect(500);
});

test('editable=false will stop edit request', t => {
    getLogger.setMuteError(true);
    t.plan(0);
    const name = 'default';
    const { request, base, perms } = getSetup();
    perms.withPermissions(UPDATE_STRATEGY);

    return request
        .put(`${base}/api/admin/strategies/${name}`)
        .send({ name, parameters: [] })
        .expect(500);
});

test('editable=true will allow delete request', t => {
    t.plan(0);
    const name = 'deleteStrat';
    const { request, base, strategyStore, perms } = getSetup();
    perms.withPermissions(DELETE_STRATEGY);
    strategyStore.createStrategy({ name, parameters: [] });

    return request
        .delete(`${base}/api/admin/strategies/${name}`)
        .send({})
        .expect(200);
});

test('editable=true will allow edit request', t => {
    t.plan(0);
    const name = 'editStrat';
    const { request, base, strategyStore, perms } = getSetup();
    perms.withPermissions(UPDATE_STRATEGY);
    strategyStore.createStrategy({ name, parameters: [] });

    return request
        .put(`${base}/api/admin/strategies/${name}`)
        .send({ name, parameters: [] })
        .expect(200);
});

test('deprecating a strategy works', async t => {
    t.plan(1);
    const name = 'editStrat';
    const { request, base, strategyStore, perms } = getSetup();
    perms.withPermissions(UPDATE_STRATEGY);
    strategyStore.createStrategy({ name, parameters: [] });

    await request
        .post(`${base}/api/admin/strategies/${name}/deprecate`)
        .send()
        .expect(200);
    return request
        .get(`${base}/api/admin/strategies/${name}`)
        .expect(200)
        .expect(res => t.is(res.body.deprecated, true));
});

test('deprecating a non-existent strategy yields 404', t => {
    t.plan(0);
    const { request, base, perms } = getSetup();
    perms.withPermissions(UPDATE_STRATEGY);
    return request
        .post(`${base}/api/admin/strategies/non-existent-strategy/deprecate`)
        .expect(404);
});

test('reactivating a strategy works', async t => {
    t.plan(1);
    const name = 'editStrat';
    const { request, base, strategyStore, perms } = getSetup();
    perms.withPermissions(UPDATE_STRATEGY);
    strategyStore.createStrategy({ name, parameters: [] });

    await request
        .post(`${base}/api/admin/strategies/${name}/reactivate`)
        .send()
        .expect(200);
    return request
        .get(`${base}/api/admin/strategies/${name}`)
        .expect(200)
        .expect(res => t.is(res.body.deprecated, false));
});

test('reactivating a non-existent strategy yields 404', t => {
    t.plan(0);
    const { request, base, perms } = getSetup();
    perms.withPermissions(UPDATE_STRATEGY);
    return request
        .post(`${base}/api/admin/strategies/non-existent-strategy/reactivate`)
        .expect(404);
});
test(`deprecating 'default' strategy will yield 403`, t => {
    t.plan(0);
    const { request, base, perms } = getSetup();
    perms.withPermissions(UPDATE_STRATEGY);
    return request
        .post(`${base}/api/admin/strategies/default/deprecate`)
        .expect(403);
});
