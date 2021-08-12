import faker from 'faker';
import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';

let db;
let stores;
let clientApplicationsStore;

beforeEach(async () => {
    db = await dbInit('client_application_store_e2e_serial', getLogger);
    stores = db.stores;
    clientApplicationsStore = stores.clientApplicationsStore;
});

afterEach(async () => {
    await db.destroy();
});

test("Should be able to keep track of what we've announced", async () => {
    const clientRegistration = {
        appName: faker.internet.domainName(),
        instanceId: faker.datatype.uuid(),
        strategies: ['default'],
        started: Date.now(),
        interval: faker.datatype.number(),
        sdkVersion: '3.11.2',
        icon: '',
        description: faker.company.catchPhrase(),
        color: faker.internet.color(),
    };
    await clientApplicationsStore.upsert(clientRegistration);
    let unannounced = await clientApplicationsStore.getUnannounced();
    expect(unannounced.length).toBe(1);
    const announce = await clientApplicationsStore.setUnannouncedToAnnounced();
    expect(announce.length).toBe(1);
    unannounced = await clientApplicationsStore.getUnannounced();
    expect(unannounced.length).toBe(0);
});

test('Multiple instances should still only announce once per app', async () => {
    const clientRegistration = {
        appName: faker.internet.domainName(),
        instanceId: faker.datatype.uuid(),
        strategies: ['default'],
        started: Date.now(),
        interval: faker.datatype.number(),
        sdkVersion: '3.11.2',
        icon: '',
        description: faker.company.catchPhrase(),
        color: faker.internet.color(),
    };
    const clientReg2 = { ...clientRegistration, instanceId: 'someotherid' };
    await clientApplicationsStore.upsert(clientRegistration);
    await clientApplicationsStore.upsert(clientReg2);
    let unannounced = await clientApplicationsStore.getUnannounced();
    expect(unannounced.length).toBe(1);
    const announce = await clientApplicationsStore.setUnannouncedToAnnounced();
    expect(announce.length).toBe(1);
    unannounced = await clientApplicationsStore.getUnannounced();
    expect(unannounced.length).toBe(0);
});

test('Multiple applications should also be possible to announce', async () => {
    const clients = [];
    while (clients.length < 10) {
        const clientRegistration = {
            appName: `${faker.internet.domainName()}_${clients.length}`,
            instanceId: faker.datatype.uuid(),
            strategies: ['default'],
            started: Date.now(),
            interval: faker.datatype.number(),
            sdkVersion: '3.11.2',
            icon: '',
            description: faker.company.catchPhrase(),
            color: faker.internet.color(),
        };
        clients.push(clientRegistration);
    }
    await clientApplicationsStore.bulkUpsert(clients);
    let unannounced = await clientApplicationsStore.getUnannounced();
    expect(unannounced.length).toBe(10);
    const announce = await clientApplicationsStore.setUnannouncedToAnnounced();
    expect(announce.length).toBe(10);
    unannounced = await clientApplicationsStore.getUnannounced();
    expect(unannounced.length).toBe(0);
});

test('Same application registered multiple times should still only be announced once', async () => {
    const clientRegistration = {
        appName: faker.internet.domainName(),
        instanceId: faker.datatype.uuid(),
        strategies: ['default'],
        started: Date.now(),
        interval: faker.datatype.number(),
        sdkVersion: '3.11.2',
        icon: '',
        description: faker.company.catchPhrase(),
        color: faker.internet.color(),
    };
    await clientApplicationsStore.upsert(clientRegistration);
    let unannounced = await clientApplicationsStore.getUnannounced();
    expect(unannounced.length).toBe(1);
    let announce = await clientApplicationsStore.setUnannouncedToAnnounced();
    expect(announce.length).toBe(1);
    unannounced = await clientApplicationsStore.getUnannounced();
    expect(unannounced.length).toBe(0);

    await clientApplicationsStore.upsert(clientRegistration);
    announce = await clientApplicationsStore.setUnannouncedToAnnounced();
    expect(announce.length).toBe(0);
});

test('Merge keeps value for single row in database', async () => {
    const clientRegistration = {
        appName: faker.internet.domainName(),
        instanceId: faker.datatype.uuid(),
        strategies: ['default'],
        started: Date.now(),
        icon: faker.internet.color(),
        description: faker.company.catchPhrase(),
        color: faker.internet.color(),
    };
    await clientApplicationsStore.upsert(clientRegistration);
    await clientApplicationsStore.upsert({
        appName: clientRegistration.appName,
        description: 'new description',
    });
    const stored = await clientApplicationsStore.getApplication(
        clientRegistration.appName,
    );
    expect(stored.color).toBe(clientRegistration.color);
    expect(stored.description).toBe('new description');
});

test('Multi row merge also works', async () => {
    const clients = [];
    while (clients.length < 10) {
        const clientRegistration = {
            appName: `${faker.internet.domainName()}_${clients.length}`,
            instanceId: faker.datatype.uuid(),
            strategies: ['default'],
            started: Date.now(),
            icon: faker.internet.color(),
            description: faker.company.catchPhrase(),
            color: faker.internet.color(),
        };
        clients.push(clientRegistration);
    }
    await clientApplicationsStore.bulkUpsert(clients);
    const alteredClients = clients.map((c) => ({
        appName: c.appName,
        icon: 'red',
    }));
    await clientApplicationsStore.bulkUpsert(alteredClients);
    const stored = await Promise.all(
        clients.map(async (c) =>
            clientApplicationsStore.getApplication(c.appName),
        ),
    );
    stored.forEach((s, i) => {
        expect(s.description).toBe(clients[i].description);
        expect(s.icon).toBe('red');
    });
});
