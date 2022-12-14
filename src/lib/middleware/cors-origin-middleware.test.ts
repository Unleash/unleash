import { allowRequestOrigin } from './cors-origin-middleware';
import FakeSettingStore from '../../test/fixtures/fake-setting-store';
import { createTestConfig } from '../../test/config/test-config';
import FakeEventStore from '../../test/fixtures/fake-event-store';
import { randomId } from '../util/random-id';
import FakeProjectStore from '../../test/fixtures/fake-project-store';
import { ProxyService, SettingService } from '../../lib/services';
import { ISettingStore } from '../../lib/types';
import { frontendSettingsKey } from '../../lib/types/settings/frontend-settings';

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

test('allowRequestOrigin', () => {
    const dotCom = 'https://example.com';
    const dotOrg = 'https://example.org';

    expect(allowRequestOrigin('', [])).toEqual(false);
    expect(allowRequestOrigin(dotCom, [])).toEqual(false);
    expect(allowRequestOrigin(dotCom, [dotOrg])).toEqual(false);

    expect(allowRequestOrigin(dotCom, [dotCom, dotOrg])).toEqual(true);
    expect(allowRequestOrigin(dotCom, [dotOrg, dotCom])).toEqual(true);
    expect(allowRequestOrigin(dotCom, [dotCom, dotCom])).toEqual(true);

    expect(allowRequestOrigin(dotCom, ['*'])).toEqual(true);
    expect(allowRequestOrigin(dotCom, [dotOrg, '*'])).toEqual(true);
    expect(allowRequestOrigin(dotCom, [dotCom, dotOrg, '*'])).toEqual(true);
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
});

test('corsOriginMiddleware without config', async () => {
    const { proxyService, settingStore } = createSettingService([]);
    const userName = randomId();
    expect(await proxyService.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });
    await proxyService.setFrontendSettings(
        { frontendApiOrigins: [] },
        userName,
    );
    expect(await proxyService.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });
    await proxyService.setFrontendSettings(
        { frontendApiOrigins: ['*'] },
        userName,
    );
    expect(await proxyService.getFrontendSettings()).toEqual({
        frontendApiOrigins: ['*'],
    });
    await settingStore.delete(frontendSettingsKey);
    expect(await proxyService.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });
});

test('corsOriginMiddleware with config', async () => {
    const { proxyService, settingStore } = createSettingService(['*']);
    const userName = randomId();
    expect(await proxyService.getFrontendSettings()).toEqual({
        frontendApiOrigins: ['*'],
    });
    await proxyService.setFrontendSettings(
        { frontendApiOrigins: [] },
        userName,
    );
    expect(await proxyService.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });
    await proxyService.setFrontendSettings(
        { frontendApiOrigins: ['https://example.com', 'https://example.org'] },
        userName,
    );
    expect(await proxyService.getFrontendSettings()).toEqual({
        frontendApiOrigins: ['https://example.com', 'https://example.org'],
    });
    await settingStore.delete(frontendSettingsKey);
    expect(await proxyService.getFrontendSettings()).toEqual({
        frontendApiOrigins: ['*'],
    });
});
