'use strict';

const test = require('ava');
const sinon = require('sinon');
const faker = require('faker');
const { setupApp } = require('../../helpers/test-helper');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');
const version = require('../../../../lib/util/version');

const asyncFilter = async (arr, predicate) => {
    const results = await Promise.all(arr.map(predicate));

    return arr.filter((_v, index) => results[index]);
};

let stores;
let db;

test.before(async () => {
    db = await dbInit('register_client', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await db.destroy();
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
    t.plan(2);
    const clock = sinon.useFakeTimers();
    const { clientInstanceStore, clientApplicationsStore } = stores;
    const request = await setupApp(stores);
    const clientRegistration = {
        appName: 'multipleRegistration',
        instanceId: 'test',
        strategies: ['default', 'another'],
        started: Date.now(),
        interval: 10,
    };

    await request
        .post('/api/client/register')
        .send(clientRegistration)
        .expect(202)
        .then(() =>
            request
                .post('/api/client/register')
                .send(clientRegistration)
                .expect(202),
        );
    await clock.tickAsync(6 * 1000);
    t.assert(clientApplicationsStore.exists(clientRegistration));
    t.assert(clientInstanceStore.exists(clientRegistration));
    clock.restore();
});

test.serial.skip('Should handle a massive bulk registration', async t => {
    const { clientInstanceStore, clientApplicationsStore } = stores;
    const request = await setupApp(stores);
    const clients = [];
    while (clients.length < 2000) {
        const clientRegistration = {
            appName: faker.internet.domainName(),
            instanceId: faker.random.uuid(),
            strategies: ['default'],
            started: Date.now(),
            interval: faker.random.number(),
            sdkVersion: version,
            icon: '',
            description: faker.company.catchPhrase(),
            color: faker.internet.color(),
        };
        clients.push(clientRegistration);
        // eslint-disable-next-line no-await-in-loop
        await request
            .post('/api/client/register')
            .send(clientRegistration)
            .expect(202);
    }
    t.is(clients.length, 2000);
    await new Promise(res => setTimeout(res, 5500));

    // Verify clientInstance
    const notSavedInstance = await asyncFilter(clients, async c => {
        const exists = await clientInstanceStore.exists(c);
        return !exists;
    });
    t.is(notSavedInstance.length, 0);

    // Verify application
    const notSavedApp = await asyncFilter(clients, async c => {
        const exists = await clientApplicationsStore.exists(c);
        return !exists;
    });
    t.is(notSavedApp.length, 0);
});
