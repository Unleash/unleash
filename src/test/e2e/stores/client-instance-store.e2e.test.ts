import { faker } from '@faker-js/faker';
import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';
import type {
    IClientInstanceStore,
    IUnleashStores,
} from '../../../lib/types/index.js';
import type { INewClientInstance } from '../../../lib/types/stores/client-instance-store.js';

let db: ITestDb;
let stores: IUnleashStores;
let clientInstanceStore: IClientInstanceStore;

beforeAll(async () => {
    db = await dbInit('client_application_store_e2e_serial', getLogger);
    stores = db.stores;
    clientInstanceStore = stores.clientInstanceStore;
});

afterAll(async () => {
    await db.destroy();
});

test('Upserting an application keeps values not provided intact', async () => {
    const clientInstance: INewClientInstance = {
        appName: faker.internet.domainName(),
        instanceId: faker.string.uuid(),
        environment: 'development',
        sdkVersion: 'unleash-client-node:6.6.0',
        sdkType: 'backend',
    };
    await clientInstanceStore.upsert(clientInstance);

    const initial = await clientInstanceStore.get(clientInstance);

    expect(initial).toMatchObject(clientInstance);

    const update: INewClientInstance = {
        appName: clientInstance.appName,
        instanceId: clientInstance.instanceId,
        environment: clientInstance.environment,
        clientIp: '::2',
    };

    await clientInstanceStore.upsert(update);

    const updated = await clientInstanceStore.get(clientInstance);

    const expectedAfterUpdate = {
        clientIp: '::2',
        sdkVersion: 'unleash-client-node:6.6.0',
        sdkType: 'backend',
    };
    expect(updated).toMatchObject(expectedAfterUpdate);

    await clientInstanceStore.bulkUpsert([clientInstance]);
    const doubleUpdated = await clientInstanceStore.get(clientInstance);

    expect(doubleUpdated).toMatchObject(expectedAfterUpdate);
});
