import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';
import { createTestConfig } from '../../config/test-config.js';
import AddonService from '../../../lib/services/addon-service.js';
import {
    type IUnleashStores,
    TEST_AUDIT_USER,
} from '../../../lib/types/index.js';

import SimpleAddon from '../../../lib/services/addon-service-test-simple-addon.js';
import TagTypeService from '../../../lib/features/tag-type/tag-type-service.js';
import { FEATURE_CREATED } from '../../../lib/events/index.js';
import { IntegrationEventsService } from '../../../lib/services/index.js';
import { createEventsService } from '../../../lib/features/index.js';

import { vi } from 'vitest';

let db: ITestDb;
let stores: IUnleashStores;
let addonService: AddonService;
const _TEST_USER_ID = -9999;

beforeAll(async () => {
    const config = createTestConfig({
        server: { baseUriPath: '/test' },
    });
    db = await dbInit('addon_service_serial', getLogger);
    stores = db.stores;
    const eventService = createEventsService(db.rawDatabase, config);
    const tagTypeService = new TagTypeService(stores, config, eventService);
    const integrationEventsService = new IntegrationEventsService(
        stores,
        config,
    );
    const addonProvider = {
        simple: new SimpleAddon({
            getLogger,
            unleashUrl: 'http://test',
            integrationEventsService,
            flagResolver: config.flagResolver,
            eventBus: config.eventBus,
        }),
    };
    addonService = new AddonService(
        stores,
        config,
        tagTypeService,
        eventService,
        integrationEventsService,
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
    vi.useFakeTimers();
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

    await addonService.createAddon(config, TEST_AUDIT_USER);
    await addonService.createAddon(config2, TEST_AUDIT_USER);
    await addonService.createAddon(config3, TEST_AUDIT_USER);

    vi.advanceTimersByTime(61_000);

    const activeAddons = await addonService.fetchAddonConfigs();
    const allAddons = await addonService.getAddons();

    expect(activeAddons.length).toBe(2);
    expect(allAddons.length).toBe(3);

    vi.useRealTimers();
});
