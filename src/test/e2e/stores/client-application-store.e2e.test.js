'use strict';

const test = require('ava');
const faker = require('faker');
const dbInit = require('../helpers/database-init');
const getLogger = require('../../fixtures/no-logger');

let db;
let stores;
let clientApplicationsStore;

test.beforeEach(async () => {
    db = await dbInit('client_application_store_e2e_serial', getLogger);
    stores = db.stores;
    clientApplicationsStore = stores.clientApplicationsStore;
});

test.afterEach(async () => {
    await db.destroy();
});

test.serial("Should be able to keep track of what we've announced", async t => {
    const clientRegistration = {
        appName: faker.internet.domainName(),
        instanceId: faker.random.uuid(),
        strategies: ['default'],
        started: Date.now(),
        interval: faker.random.number(),
        sdkVersion: '3.11.2',
        icon: '',
        description: faker.company.catchPhrase(),
        color: faker.internet.color(),
    };
    await clientApplicationsStore.upsert(clientRegistration);
    let unannounced = await clientApplicationsStore.getUnannounced();
    t.is(unannounced.length, 1);
    const announce = await clientApplicationsStore.setUnannouncedToAnnounced();
    t.is(announce.length, 1);
    unannounced = await clientApplicationsStore.getUnannounced();
    t.is(unannounced.length, 0);
});

test.serial(
    'Multiple instances should still only announce once per app',
    async t => {
        const clientRegistration = {
            appName: faker.internet.domainName(),
            instanceId: faker.random.uuid(),
            strategies: ['default'],
            started: Date.now(),
            interval: faker.random.number(),
            sdkVersion: '3.11.2',
            icon: '',
            description: faker.company.catchPhrase(),
            color: faker.internet.color(),
        };
        const clientReg2 = { ...clientRegistration, instanceId: 'someotherid' };
        await clientApplicationsStore.upsert(clientRegistration);
        await clientApplicationsStore.upsert(clientReg2);
        let unannounced = await clientApplicationsStore.getUnannounced();
        t.is(unannounced.length, 1);
        const announce = await clientApplicationsStore.setUnannouncedToAnnounced();
        t.is(announce.length, 1);
        unannounced = await clientApplicationsStore.getUnannounced();
        t.is(unannounced.length, 0);
    },
);

test.serial(
    'Multiple applications should also be possible to announce',
    async t => {
        const clients = [];
        while (clients.length < 10) {
            const clientRegistration = {
                appName: `${faker.internet.domainName()}_${clients.length}`,
                instanceId: faker.random.uuid(),
                strategies: ['default'],
                started: Date.now(),
                interval: faker.random.number(),
                sdkVersion: '3.11.2',
                icon: '',
                description: faker.company.catchPhrase(),
                color: faker.internet.color(),
            };
            clients.push(clientRegistration);
        }
        await clientApplicationsStore.bulkUpsert(clients);
        let unannounced = await clientApplicationsStore.getUnannounced();
        t.is(unannounced.length, 10);
        const announce = await clientApplicationsStore.setUnannouncedToAnnounced();
        t.is(announce.length, 10);
        unannounced = await clientApplicationsStore.getUnannounced();
        t.is(unannounced.length, 0);
    },
);

test.serial(
    'Same application registered multiple times should still only be announced once',
    async t => {
        const clientRegistration = {
            appName: faker.internet.domainName(),
            instanceId: faker.random.uuid(),
            strategies: ['default'],
            started: Date.now(),
            interval: faker.random.number(),
            sdkVersion: '3.11.2',
            icon: '',
            description: faker.company.catchPhrase(),
            color: faker.internet.color(),
        };
        await clientApplicationsStore.upsert(clientRegistration);
        let unannounced = await clientApplicationsStore.getUnannounced();
        t.is(unannounced.length, 1);
        let announce = await clientApplicationsStore.setUnannouncedToAnnounced();
        t.is(announce.length, 1);
        unannounced = await clientApplicationsStore.getUnannounced();
        t.is(unannounced.length, 0);

        await clientApplicationsStore.upsert(clientRegistration);
        announce = await clientApplicationsStore.setUnannouncedToAnnounced();
        t.is(announce.length, 0);
    },
);
