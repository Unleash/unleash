import { resolveOrigin } from './cors-origin-middleware';
import FakeSettingStore from '../../test/fixtures/fake-setting-store';
import { createTestConfig } from '../../test/config/test-config';
import FakeEventStore from '../../test/fixtures/fake-event-store';
import { randomId } from '../util/random-id';
import FakeProjectStore from '../../test/fixtures/fake-project-store';
import { ProxyService, SettingService } from '../../lib/services';
import { ISettingStore } from '../../lib/types';
import { frontendSettingsKey } from '../../lib/types/settings/frontend-settings';
import { minutesToMilliseconds } from 'date-fns';

const createSettingService = (
    frontendApiOrigins: string[],
): { proxyService: ProxyService; settingStore: ISettingStore } => {
    const config = createTestConfig({ frontendApiOrigins });

    const stores = {
        settingStore: new FakeSettingStore(),
        eventStore: new FakeEventStore(),
        projectStore: new FakeProjectStore(),
    };

    const services = {
        settingService: new SettingService(stores, config),
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
        ),
    ).rejects.toThrow('Invalid origin: a');
    proxyService.destroy();
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
    );
    expect(await proxyService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    await proxyService.setFrontendSettings(
        { frontendApiOrigins: ['*'] },
        userName,
    );
    expect(await proxyService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['*'],
    });
    await settingStore.delete(frontendSettingsKey);
    expect(await proxyService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    proxyService.destroy();
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
    );
    expect(await proxyService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: [],
    });
    await proxyService.setFrontendSettings(
        { frontendApiOrigins: ['https://example.com', 'https://example.org'] },
        userName,
    );
    expect(await proxyService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['https://example.com', 'https://example.org'],
    });
    await settingStore.delete(frontendSettingsKey);
    expect(await proxyService.getFrontendSettings(false)).toEqual({
        frontendApiOrigins: ['*'],
    });
    proxyService.destroy();
});

test('corsOriginMiddleware with caching enabled', async () => {
    jest.useFakeTimers();

    const { proxyService } = createSettingService([]);

    const userName = randomId();
    expect(await proxyService.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });

    //setting
    await proxyService.setFrontendSettings(
        { frontendApiOrigins: ['*'] },
        userName,
    );

    //still get cached value
    expect(await proxyService.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });

    jest.advanceTimersByTime(minutesToMilliseconds(2));

    jest.useRealTimers();

    /*
    This is needed because it is not enough to fake time to test the
    updated cache, we also need to make sure that all promises are 
    executed and completed, in the right order. 
    */
    await new Promise<void>((resolve) =>
        process.nextTick(async () => {
            const settings = await proxyService.getFrontendSettings();

            expect(settings).toEqual({
                frontendApiOrigins: ['*'],
            });
            resolve();
        }),
    );
    proxyService.destroy();
});
