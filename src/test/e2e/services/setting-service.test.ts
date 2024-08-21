import SettingService from '../../../lib/services/setting-service';
import { createTestConfig } from '../../config/test-config';
import dbInit, { type ITestDb } from '../helpers/database-init';
import type { IUnleashStores } from '../../../lib/types/stores';
import {
    SETTING_CREATED,
    SETTING_DELETED,
    SETTING_UPDATED,
} from '../../../lib/types/events';
import { TEST_AUDIT_USER } from '../../../lib/types';
import { createEventsService } from '../../../lib/features';

let stores: IUnleashStores;
let db: ITestDb;
let service: SettingService;
const TEST_USER_ID = -9999;

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit('setting_service_serial', config.getLogger);
    stores = db.stores;
    const eventService = createEventsService(db.rawDatabase, config);
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
    await service.insert('some-setting', someData, TEST_AUDIT_USER, false);
    const actual = await service.get('some-setting');

    expect(actual).toStrictEqual(someData);
    const { eventStore } = stores;
    const createdEvents = await eventStore.deprecatedSearchEvents({
        type: SETTING_CREATED,
    });
    expect(createdEvents).toHaveLength(1);
    expect(createdEvents[0].data).toEqual({ id: 'some-setting', some: 'blob' });
});

test('Can delete setting', async () => {
    const someData = { some: 'blob' };
    await service.insert('some-setting', someData, TEST_AUDIT_USER);
    await service.delete('some-setting', TEST_AUDIT_USER);

    const actual = await service.get('some-setting');
    expect(actual).toBeUndefined();
    const { eventStore } = stores;
    const createdEvents = await eventStore.deprecatedSearchEvents({
        type: SETTING_DELETED,
    });
    expect(createdEvents).toHaveLength(1);
});

test('Sentitive SSO settings are redacted in event log', async () => {
    const someData = { password: 'mySecretPassword' };
    const property = 'unleash.enterprise.auth.oidc';
    await service.insert(property, someData, TEST_AUDIT_USER);

    await service.insert(property, { password: 'changed' }, TEST_AUDIT_USER);
    const actual = await service.get(property);
    const { eventStore } = stores;

    const updatedEvents = await eventStore.deprecatedSearchEvents({
        type: SETTING_UPDATED,
    });
    expect(updatedEvents[0].preData).toEqual({ hideEventDetails: true });
    await service.delete(property, TEST_AUDIT_USER);
});

test('Can update setting', async () => {
    const { eventStore } = stores;
    const someData = { some: 'blob' };
    await service.insert('updated-setting', someData, TEST_AUDIT_USER, false);
    await service.insert(
        'updated-setting',
        { ...someData, test: 'fun' },
        TEST_AUDIT_USER,
        false,
    );
    const updatedEvents = await eventStore.deprecatedSearchEvents({
        type: SETTING_UPDATED,
    });
    expect(updatedEvents).toHaveLength(1);
    expect(updatedEvents[0].data).toEqual({
        id: 'updated-setting',
        some: 'blob',
        test: 'fun',
    });
});
