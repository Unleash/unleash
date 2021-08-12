import SettingService from '../../../lib/services/setting-service';
import { createTestConfig } from '../../config/test-config';
import dbInit from '../helpers/database-init';
import { IUnleashStores } from '../../../lib/types/stores';

let stores: IUnleashStores;
let db;
let service: SettingService;

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit('setting_service_serial', config.getLogger);
    stores = db.stores;
    service = new SettingService(stores, config);
});
afterAll(async () => {
    await db.destroy();
});

test('Can create new setting', async () => {
    const someData = { some: 'blob' };
    await service.insert('some-setting', someData);
    const actual = await service.get('some-setting');

    expect(actual).toStrictEqual(someData);
});

test('Can delete setting', async () => {
    const someData = { some: 'blob' };
    await service.insert('some-setting', someData);
    await service.delete('some-setting');

    const actual = await service.get('some-setting');
    expect(actual).toBeUndefined();
});
