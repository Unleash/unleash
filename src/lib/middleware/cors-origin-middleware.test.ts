import { allowRequestOrigin } from './cors-origin-middleware';
import FakeSettingStore from '../../test/fixtures/fake-setting-store';
import SettingService from '../services/setting-service';
import { createTestConfig } from '../../test/config/test-config';
import FakeEventStore from '../../test/fixtures/fake-event-store';
import { randomId } from '../util/random-id';
import { frontendSettingsKey } from '../types/settings/frontend-settings';

const createSettingService = (frontendApiOrigins: string[]): SettingService => {
    const config = createTestConfig({ frontendApiOrigins });

    const stores = {
        settingStore: new FakeSettingStore(),
        eventStore: new FakeEventStore(),
    };

    return new SettingService(stores, config);
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
    const service = createSettingService([]);
    const userName = randomId();
    await expect(() =>
        service.setFrontendSettings({ frontendApiOrigins: ['a'] }, userName),
    ).rejects.toThrow('Invalid origin: a');
});

test('corsOriginMiddleware without config', async () => {
    const service = createSettingService([]);
    const userName = randomId();
    expect(await service.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });
    await service.setFrontendSettings({ frontendApiOrigins: [] }, userName);
    expect(await service.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });
    await service.setFrontendSettings({ frontendApiOrigins: ['*'] }, userName);
    expect(await service.getFrontendSettings()).toEqual({
        frontendApiOrigins: ['*'],
    });
    await service.delete(frontendSettingsKey, userName);
    expect(await service.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });
});

test('corsOriginMiddleware with config', async () => {
    const service = createSettingService(['*']);
    const userName = randomId();
    expect(await service.getFrontendSettings()).toEqual({
        frontendApiOrigins: ['*'],
    });
    await service.setFrontendSettings({ frontendApiOrigins: [] }, userName);
    expect(await service.getFrontendSettings()).toEqual({
        frontendApiOrigins: [],
    });
    await service.setFrontendSettings(
        { frontendApiOrigins: ['https://example.com', 'https://example.org'] },
        userName,
    );
    expect(await service.getFrontendSettings()).toEqual({
        frontendApiOrigins: ['https://example.com', 'https://example.org'],
    });
    await service.delete(frontendSettingsKey, userName);
    expect(await service.getFrontendSettings()).toEqual({
        frontendApiOrigins: ['*'],
    });
});
