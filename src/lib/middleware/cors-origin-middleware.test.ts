import { resolveOrigin } from './cors-origin-middleware.js';
import FakeSettingStore from '../../test/fixtures/fake-setting-store.js';
import { createTestConfig } from '../../test/config/test-config.js';
import FakeEventStore from '../../test/fixtures/fake-event-store.js';
import FakeProjectStore from '../../test/fixtures/fake-project-store.js';
import {
    FrontendApiService,
    SettingService,
} from '../../lib/services/index.js';
import { type ISettingStore, TEST_AUDIT_USER } from '../../lib/types/index.js';
import { frontendSettingsKey } from '../../lib/types/settings/frontend-settings.js';
import FakeFeatureTagStore from '../../test/fixtures/fake-feature-tag-store.js';
import { createFakeEventsService } from '../features/index.js';
import type { GlobalFrontendApiCache } from '../features/frontend-api/global-frontend-api-cache.js';
import type { Services } from '../features/frontend-api/frontend-api-service.js';

const createSettingService = (
    frontendApiOrigins: string[],
): { frontendApiService: FrontendApiService; settingStore: ISettingStore } => {
    const config = createTestConfig({ frontendApiOrigins });

    const stores = {
        settingStore: new FakeSettingStore(),
        eventStore: new FakeEventStore(),
        featureTagStore: new FakeFeatureTagStore(),
        projectStore: new FakeProjectStore(),
    };

    const eventService = createFakeEventsService(config);

    const services = {
        settingService: new SettingService(stores, config, eventService),
    };

    return {
        frontendApiService: new FrontendApiService(
            config,
            services as Services,
            {} as GlobalFrontendApiCache,
        ),
        settingStore: stores.settingStore,
    };
};

test('resolveOrigin', () => {
    const dotCom = 'https://example.com';
    const dotOrg = 'https://example.org';

    expect(resolveOrigin([])).toEqual('*');
    expect(resolveOrigin(['*'])).toEqual('*');
    expect(resolveOrigin([dotOrg])).toEqual([dotOrg]);
    expect(resolveOrigin([dotCom, dotOrg])).toEqual([dotCom, dotOrg]);
    expect(resolveOrigin([dotOrg, '*'])).toEqual('*');
});

test('corsOriginMiddleware origin validation', async () => {
    const { frontendApiService } = createSettingService([]);
    await expect(() =>
        frontendApiService.setFrontendCorsSettings(['a'], TEST_AUDIT_USER),
    ).rejects.toThrow('Invalid origin: a');
});

test('corsOriginMiddleware without config', async () => {
    const { frontendApiService, settingStore } = createSettingService([]);
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    await frontendApiService.setFrontendCorsSettings([], TEST_AUDIT_USER);
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    await frontendApiService.setFrontendCorsSettings(['*'], TEST_AUDIT_USER);
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['*'],
    });
    await settingStore.delete(frontendSettingsKey);
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
});

test('corsOriginMiddleware with config', async () => {
    const { frontendApiService, settingStore } = createSettingService(['*']);
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['*'],
    });
    await frontendApiService.setFrontendCorsSettings([], TEST_AUDIT_USER);
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    await frontendApiService.setFrontendCorsSettings(
        ['https://example.com', 'https://example.org'],
        TEST_AUDIT_USER,
    );
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['https://example.com', 'https://example.org'],
    });
    await settingStore.delete(frontendSettingsKey);
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['*'],
    });
});

test('corsOriginMiddleware with caching enabled', async () => {
    const { frontendApiService } = createSettingService([]);

    expect(await frontendApiService.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });

    //setting
    await frontendApiService.setFrontendCorsSettings(['*'], TEST_AUDIT_USER);

    //still get cached value
    expect(await frontendApiService.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });

    await frontendApiService.fetchFrontendSettings(); // called by the scheduler service

    const settings = await frontendApiService.getFrontendSettings();

    expect(settings).toEqual({
        frontendApiOrigins: ['*'],
    });
});
