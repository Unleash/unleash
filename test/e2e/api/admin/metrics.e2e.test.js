'use strict';

const test = require('ava');
const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;

test.before(async () => {
    stores = await dbInit('metrics_serial', getLogger);
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('should register client', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            instanceId: 'test',
            strategies: ['default'],
            started: Date.now(),
            interval: 10,
        })
        .expect(202);
});

test.serial('should allow client to register multiple times', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    const clientRegistration = {
        appName: 'multipleRegistration',
        instanceId: 'test',
        strategies: ['default', 'another'],
        started: Date.now(),
        interval: 10,
    };

    return request
        .post('/api/client/register')
        .send(clientRegistration)
        .expect(202)
        .then(() =>
            request
                .post('/api/client/register')
                .send(clientRegistration)
                .expect(202)
        );
});

test.serial('should accept client metrics', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {},
            },
        })
        .expect(202);
});

test.serial('should get application details', async t => {
    t.plan(3);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/metrics/applications/demo-app-1')
        .expect('Content-Type', /json/)
        .expect(res => {
            t.true(res.status === 200);
            t.true(res.body.appName === 'demo-app-1');
            t.true(res.body.instances.length === 1);
        });
});

// TODO: need to reset databse data before this test
// (now it depends on 2 prev. test cases to get 4 instances)
test.serial('should get list of applications', async t => {
    t.plan(2);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/metrics/applications')
        .expect('Content-Type', /json/)
        .expect(res => {
            t.true(res.status === 200);
            t.is(res.body.applications.length, 4);
        });
});
