import { faker } from '@faker-js/faker';
import { type IUnleashTest, setupApp } from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import version from '../../../../lib/util/version.js';
import { vi } from 'vitest';

const asyncFilter = async (arr, predicate) => {
    const results = await Promise.all(arr.map(predicate));

    return arr.filter((_v, index) => results[index]);
};

let app: IUnleashTest;
let db: ITestDb;

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
    vi.useFakeTimers();
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

    await app.services.clientInstanceService.bulkAdd();

    expect(
        await clientApplicationsStore.exists(clientRegistration.appName),
    ).toBeTruthy();
    expect(await clientInstanceStore.exists(clientRegistration)).toBeTruthy();
    vi.useRealTimers();
});

test.skip('Should handle a massive bulk registration', async () => {
    const { clientInstanceStore, clientApplicationsStore } = db.stores;

    const clients: {
        appName: string;
        instanceId: string;
        strategies: string[];
        started: number;
        interval: number;
        sdkVersion: string;
        icon: string;
        description: string;
        color: string;
    }[] = [];
    while (clients.length < 2000) {
        const clientRegistration = {
            appName: faker.internet.domainName(),
            instanceId: faker.string.uuid(),
            strategies: ['default'],
            started: Date.now(),
            interval: faker.number.int(),
            sdkVersion: version,
            icon: '',
            description: faker.company.catchPhrase(),
            color: faker.color.rgb(),
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
