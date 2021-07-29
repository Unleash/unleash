import fetchMock from 'jest-fetch-mock';
import createStores from '../../test/fixtures/store';
import version from '../util/version';
import getLogger from '../../test/fixtures/no-logger';

import VersionService from './version-service';

beforeEach(() => {
    fetchMock.resetMocks();
});

test('yields current versions', async () => {
    const testurl = 'https://version.test';
    const { settingStore } = createStores();
    await settingStore.insert('instanceInfo', { id: '1234abc' });
    const latest = {
        oss: '5.0.0',
        enterprise: '5.0.0',
    };
    fetchMock.mockResponse(
        JSON.stringify({
            latest: false,
            versions: latest,
        }),
        { status: 200 },
    );
    const service = new VersionService(
        { settingStore },
        {
            getLogger,
            versionCheck: { url: testurl, enable: true },
        },
    );
    await service.checkLatestVersion();
    const versionInfo = service.getVersionInfo();
    expect(versionInfo.current.oss).toBe(version);
    expect(versionInfo.current.enterprise).toBeFalsy();
    // @ts-ignore
    expect(versionInfo.latest.oss).toBe(latest.oss);
    // @ts-ignore
    expect(versionInfo.latest.enterprise).toBe(latest.enterprise);
});

test('supports setting enterprise version as well', async () => {
    const testurl = `https://version.test${Math.random() * 1000}`;
    const { settingStore } = createStores();
    const enterpriseVersion = '3.7.0';
    await settingStore.insert('instanceInfo', { id: '1234abc' });
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    fetchMock.mockResponse(
        JSON.stringify({
            latest: false,
            versions: latest,
        }),
        { status: 200 },
    );

    const service = new VersionService(
        { settingStore },
        {
            getLogger,
            versionCheck: { url: testurl, enable: true },
            enterpriseVersion,
        },
    );
    await service.checkLatestVersion();
    const versionInfo = service.getVersionInfo();
    expect(versionInfo.current.oss).toBe(version);
    expect(versionInfo.current.enterprise).toBe(enterpriseVersion);
    // @ts-ignore
    expect(versionInfo.latest.oss).toBe(latest.oss);
    // @ts-ignore
    expect(versionInfo.latest.enterprise).toBe(latest.enterprise);
});

test('if version check is not enabled should not make any calls', async () => {
    const testurl = `https://version.test${Math.random() * 1000}`;
    const { settingStore } = createStores();
    const enterpriseVersion = '3.7.0';
    await settingStore.insert('instanceInfo', { id: '1234abc' });
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    fetchMock.mockResponse(
        JSON.stringify({
            latest: false,
            versions: latest,
        }),
        { status: 200 },
    );

    const service = new VersionService(
        { settingStore },
        {
            getLogger,
            versionCheck: { url: testurl, enable: false },
            enterpriseVersion,
        },
    );
    await service.checkLatestVersion();
    const versionInfo = service.getVersionInfo();
    expect(fetchMock.mock.calls).toHaveLength(0);
    expect(versionInfo.current.oss).toBe(version);
    expect(versionInfo.current.enterprise).toBe(enterpriseVersion);
    // @ts-ignore
    expect(versionInfo.latest.oss).toBeFalsy();
    // @ts-ignore
    expect(versionInfo.latest.enterprise).toBeFalsy();
});
