import SettingService from '../../../lib/services/setting-service';
import { createTestConfig } from '../../config/test-config';
import dbInit from '../helpers/database-init';
import { IUnleashStores } from '../../../lib/types/stores';
import {
    SETTING_CREATED,
    SETTING_DELETED,
    SETTING_UPDATED,
} from '../../../lib/types/events';

let stores: IUnleashStores;
let db;
let service: SettingService;

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit('setting_service_serial', config.getLogger);
    stores = db.stores;
    service = new SettingService(stores, config);
});
beforeEach(async () => {
    await stores.eventStore.deleteAll();
});
afterAll(async () => {
    await db.destroy();
});

test('Can create new setting', async () => {
    const someData = { some: 'blob' };
    await service.insert('some-setting', someData, 'test-user');
    const actual = await service.get('some-setting');

    expect(actual).toStrictEqual(someData);
    const { eventStore } = stores;
    const createdEvents = await eventStore.searchEvents({
        type: SETTING_CREATED,
    });
    expect(createdEvents).toHaveLength(1);
});

test('Can delete setting', async () => {
    const someData = { some: 'blob' };
    await service.insert('some-setting', someData, 'test-user');
    await service.delete('some-setting', 'test-user');

    const actual = await service.get('some-setting');
    expect(actual).toBeUndefined();
    const { eventStore } = stores;
    const createdEvents = await eventStore.searchEvents({
        type: SETTING_DELETED,
    });
    expect(createdEvents).toHaveLength(1);
});

test('Can update setting', async () => {
    const { eventStore } = stores;
    const someData = { some: 'blob' };
    await service.insert('updated-setting', someData, 'test-user');
    await service.insert(
        'updated-setting',
        { ...someData, test: 'fun' },
        'test-user',
    );
    const updatedEvents = await eventStore.searchEvents({
        type: SETTING_UPDATED,
    });
    expect(updatedEvents).toHaveLength(1);
});
