import { resolveOrigin } from './cors-origin-middleware';
import FakeSettingStore from '../../test/fixtures/fake-setting-store';
import { createTestConfig } from '../../test/config/test-config';
import FakeEventStore from '../../test/fixtures/fake-event-store';
import { randomId } from '../util/random-id';
import FakeProjectStore from '../../test/fixtures/fake-project-store';
import { EventService, ProxyService, SettingService } from '../../lib/services';
import { ISettingStore } from '../../lib/types';
import { frontendSettingsKey } from '../../lib/types/settings/frontend-settings';
import FakeFeatureTagStore from '../../test/fixtures/fake-feature-tag-store';

const TEST_USER_ID = -9999;
const createSettingService = (
    frontendApiOrigins: string[],
): { proxyService: ProxyService; settingStore: ISettingStore } => {
    const config = createTestConfig({ frontendApiOrigins });

    const stores = {
        settingStore: new FakeSettingStore(),
        eventStore: new FakeEventStore(),
        featureTagStore: new FakeFeatureTagStore(),
        projectStore: new FakeProjectStore(),
    };

    const eventService = new EventService(stores, config);

    const services = {
        settingService: new SettingService(stores, config, eventService),
    };

    return {
        //@ts-ignore
        proxyService: new ProxyService(config, stores, services),
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
    const { proxyService } = createSettingService([]);
    const userName = randomId();
    await expect(() =>
        proxyService.setFrontendSettings(
            { frontendApiOrigins: ['a'] },
            userName,
            TEST_USER_ID,
        ),
    ).rejects.toThrow('Invalid origin: a');
});

test('corsOriginMiddleware without config', async () => {
    const { proxyService, settingStore } = createSettingService([]);
    const userName = randomId();
    expect(await proxyService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    await proxyService.setFrontendSettings(
        { frontendApiOrigins: [] },
        userName,
        TEST_USER_ID,
    );
    expect(await proxyService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    await proxyService.setFrontendSettings(
        { frontendApiOrigins: ['*'] },
        userName,
        TEST_USER_ID,
    );
    expect(await proxyService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['*'],
    });
    await settingStore.delete(frontendSettingsKey);
    expect(await proxyService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
});

test('corsOriginMiddleware with config', async () => {
    const { proxyService, settingStore } = createSettingService(['*']);
    const userName = randomId();
    expect(await proxyService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['*'],
    });
    await proxyService.setFrontendSettings(
        { frontendApiOrigins: [] },
        userName,
        TEST_USER_ID,
    );
    expect(await proxyService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    await proxyService.setFrontendSettings(
        { frontendApiOrigins: ['https://example.com', 'https://example.org'] },
        userName,
        TEST_USER_ID,
    );
    expect(await proxyService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['https://example.com', 'https://example.org'],
    });
    await settingStore.delete(frontendSettingsKey);
    expect(await proxyService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['*'],
    });
});

test('corsOriginMiddleware with caching enabled', async () => {
    const { proxyService } = createSettingService([]);

    const userName = randomId();
    expect(await proxyService.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });

    //setting
    await proxyService.setFrontendSettings(
        { frontendApiOrigins: ['*'] },
        userName,
        TEST_USER_ID,
    );

    //still get cached value
    expect(await proxyService.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });

    await proxyService.fetchFrontendSettings(); // called by the scheduler service

    const settings = await proxyService.getFrontendSettings();

    expect(settings).toEqual({
        frontendApiOrigins: ['*'],
    });
});
