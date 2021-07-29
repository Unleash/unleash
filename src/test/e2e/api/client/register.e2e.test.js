'use strict';

const faker = require('faker');
const { setupApp } = require('../../helpers/test-helper');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');
const version = require('../../../../lib/util/version');

const asyncFilter = async (arr, predicate) => {
    const results = await Promise.all(arr.map(predicate));

    return arr.filter((_v, index) => results[index]);
};

let app;
let db;

beforeAll(async () => {
    db = await dbInit('register_client', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should register client', async () => {
    expect.assertions(0);
    return app.request
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

test('should allow client to register multiple times', async () => {
    expect.assertions(2);
    jest.useFakeTimers('modern');
    const { clientInstanceStore, clientApplicationsStore } = db.stores;

    const clientRegistration = {
        appName: 'multipleRegistration',
        instanceId: 'test',
        strategies: ['default', 'another'],
        started: Date.now(),
        interval: 10,
    };

    await app.request
        .post('/api/client/register')
        .send(clientRegistration)
        .expect(202);

    await app.request
        .post('/api/client/register')
        .send(clientRegistration)
        .expect(202);

    jest.advanceTimersByTime(6 * 1000);
    expect(clientApplicationsStore.exists(clientRegistration)).toBeTruthy();
    expect(clientInstanceStore.exists(clientRegistration)).toBeTruthy();
    jest.useRealTimers();
});

test.skip('Should handle a massive bulk registration', async () => {
    const { clientInstanceStore, clientApplicationsStore } = db.stores;

    const clients = [];
    while (clients.length < 2000) {
        const clientRegistration = {
            appName: faker.internet.domainName(),
            instanceId: faker.datatype.uuid(),
            strategies: ['default'],
            started: Date.now(),
            interval: faker.datatype.number(),
            sdkVersion: version,
            icon: '',
            description: faker.company.catchPhrase(),
            color: faker.internet.color(),
        };
        clients.push(clientRegistration);
        // eslint-disable-next-line no-await-in-loop
        await app.request
            .post('/api/client/register')
            .send(clientRegistration)
            .expect(202);
    }
    expect(clients.length).toBe(2000);
    await new Promise((res) => setTimeout(res, 5500));

    // Verify clientInstance
    const notSavedInstance = await asyncFilter(clients, async (c) => {
        const exists = await clientInstanceStore.exists(c);
        return !exists;
    });
    expect(notSavedInstance.length).toBe(0);

    // Verify application
    const notSavedApp = await asyncFilter(clients, async (c) => {
        const exists = await clientApplicationsStore.exists(c);
        return !exists;
    });
    expect(notSavedApp.length).toBe(0);
});
