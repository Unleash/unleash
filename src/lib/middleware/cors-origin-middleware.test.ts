import { resolveOrigin } from './cors-origin-middleware';
import FakeSettingStore from '../../test/fixtures/fake-setting-store';
import { createTestConfig } from '../../test/config/test-config';
import FakeEventStore from '../../test/fixtures/fake-event-store';
import { randomId } from '../util/random-id';
import FakeProjectStore from '../../test/fixtures/fake-project-store';
import { FrontendApiService, SettingService } from '../../lib/services';
import { type ISettingStore, TEST_AUDIT_USER } from '../../lib/types';
import { frontendSettingsKey } from '../../lib/types/settings/frontend-settings';
import FakeFeatureTagStore from '../../test/fixtures/fake-feature-tag-store';
import { createFakeEventsService } from '../features';

const TEST_USER_ID = -9999;
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
        //@ts-ignore
        frontendApiService: new FrontendApiService(config, stores, services),
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
    const userName = randomId();
    await expect(() =>
        frontendApiService.setFrontendSettings(
            { frontendApiOrigins: ['a'] },
            TEST_AUDIT_USER,
        ),
    ).rejects.toThrow('Invalid origin: a');
});

test('corsOriginMiddleware without config', async () => {
    const { frontendApiService, settingStore } = createSettingService([]);
    const userName = randomId();
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    await frontendApiService.setFrontendSettings(
        { frontendApiOrigins: [] },
        TEST_AUDIT_USER,
    );
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    await frontendApiService.setFrontendSettings(
        { frontendApiOrigins: ['*'] },
        TEST_AUDIT_USER,
    );
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
    const userName = randomId();
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['*'],
    });
    await frontendApiService.setFrontendSettings(
        { frontendApiOrigins: [] },
        TEST_AUDIT_USER,
    );
    expect(await frontendApiService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    await frontendApiService.setFrontendSettings(
        { frontendApiOrigins: ['https://example.com', 'https://example.org'] },
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

    const userName = randomId();
    expect(await frontendApiService.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });

    //setting
    await frontendApiService.setFrontendSettings(
        { frontendApiOrigins: ['*'] },
        TEST_AUDIT_USER,
    );

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
