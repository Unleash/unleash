import SettingService from '../../../lib/services/setting-service';
import { createTestConfig } from '../../config/test-config';
import dbInit, { ITestDb } from '../helpers/database-init';
import { IUnleashStores } from '../../../lib/types/stores';
import {
    SETTING_CREATED,
    SETTING_DELETED,
    SETTING_UPDATED,
} from '../../../lib/types/events';
import { EventService } from '../../../lib/services';

let stores: IUnleashStores;
let db: ITestDb;
let service: SettingService;
const TEST_USER_ID = -9999;

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit('setting_service_serial', config.getLogger);
    stores = db.stores;
    const eventService = new EventService(stores, config);
    service = new SettingService(stores, config, eventService);
});
beforeEach(async () => {
    await stores.eventStore.deleteAll();
});
afterAll(async () => {
    await db.destroy();
});

test('Can create new setting', async () => {
    const someData = { some: 'blob' };
    await service.insert(
        'some-setting',
        someData,
        'test-user',
        TEST_USER_ID,
        false,
    );
    const actual = await service.get('some-setting');

    expect(actual).toStrictEqual(someData);
    const { eventStore } = stores;
    const createdEvents = await eventStore.searchEvents({
        type: SETTING_CREATED,
    });
    expect(createdEvents).toHaveLength(1);
    expect(createdEvents[0].data).toEqual({ id: 'some-setting', some: 'blob' });
});

test('Can delete setting', async () => {
    const someData = { some: 'blob' };
    await service.insert('some-setting', someData, 'test-user', TEST_USER_ID);
    await service.delete('some-setting', 'test-user', TEST_USER_ID);

    const actual = await service.get('some-setting');
    expect(actual).toBeUndefined();
    const { eventStore } = stores;
    const createdEvents = await eventStore.searchEvents({
        type: SETTING_DELETED,
    });
    expect(createdEvents).toHaveLength(1);
});

test('Sentitive SSO settings are redacted in event log', async () => {
    const someData = { password: 'mySecretPassword' };
    const property = 'unleash.enterprise.auth.oidc';
    await service.insert(property, someData, 'a-user-in-places', TEST_USER_ID);

    await service.insert(
        property,
        { password: 'changed' },
        'a-user-in-places',
        TEST_USER_ID,
    );
    const actual = await service.get(property);
    const { eventStore } = stores;

    const updatedEvents = await eventStore.searchEvents({
        type: SETTING_UPDATED,
    });
    expect(updatedEvents[0].preData).toEqual({ hideEventDetails: true });
    await service.delete(property, 'test-user', TEST_USER_ID);
});

test('Can update setting', async () => {
    const { eventStore } = stores;
    const someData = { some: 'blob' };
    await service.insert(
        'updated-setting',
        someData,
        'test-user',
        TEST_USER_ID,
        false,
    );
    await service.insert(
        'updated-setting',
        { ...someData, test: 'fun' },
        'test-user',
        TEST_USER_ID,
        false,
    );
    const updatedEvents = await eventStore.searchEvents({
        type: SETTING_UPDATED,
    });
    expect(updatedEvents).toHaveLength(1);
    expect(updatedEvents[0].data).toEqual({
        id: 'updated-setting',
        some: 'blob',
        test: 'fun',
    });
});
