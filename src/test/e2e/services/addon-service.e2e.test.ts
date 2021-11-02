import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import { createTestConfig } from '../../config/test-config';
import AddonService from '../../../lib/services/addon-service';
import { IUnleashStores } from '../../../lib/types';

import SimpleAddon from '../../../lib/services/addon-service-test-simple-addon';
import TagTypeService from '../../../lib/services/tag-type-service';
import { FEATURE_CREATED } from '../../../lib/types/events';

const addonProvider = { simple: new SimpleAddon() };

let db;
let stores: IUnleashStores;
let addonService: AddonService;

beforeAll(async () => {
    const config = createTestConfig({
        server: { baseUriPath: '/test' },
    });
    db = await dbInit('addon_service_serial', getLogger);
    stores = db.stores;
    const tagTypeService = new TagTypeService(stores, config);
    addonService = new AddonService(
        stores,
        config,
        tagTypeService,
        addonProvider,
    );
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
afterEach(async () => {
    const addons = await stores.addonStore.getAll();
    const deleteAll = addons.map((a) => stores.addonStore.delete(a.id));
    await Promise.all(deleteAll);
});

test('should only return active addons', async () => {
    jest.useFakeTimers();
    const config = {
        provider: 'simple',
        enabled: false,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
        description: '',
    };

    const config2 = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
        description: '',
    };
    const config3 = {
        provider: 'simple',
        enabled: true,
        parameters: {
            url: 'http://localhost/wh',
            var: 'some-value',
        },
        events: [FEATURE_CREATED],
        description: '',
    };

    await addonService.createAddon(config, 'me@mail.com');
    await addonService.createAddon(config2, 'me@mail.com');
    await addonService.createAddon(config3, 'me@mail.com');

    jest.advanceTimersByTime(61_000);

    const activeAddons = await addonService.fetchAddonConfigs();
    const allAddons = await addonService.getAddons();

    expect(activeAddons.length).toBe(2);
    expect(allAddons.length).toBe(3);

    jest.useRealTimers();
});
