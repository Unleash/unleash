const fetchMock = require('fetch-mock').sandbox();
const stores = require('../../test/fixtures/store');
const getLogger = require('../../test/fixtures/no-logger');
const version = require('../util/version');

jest.mock('node-fetch', () => fetchMock);

const VersionService = require('./version-service');

test('yields current versions', async () => {
    const testurl = 'https://version.test';
    const { settingStore } = stores.createStores();
    await settingStore.insert({
        name: 'instanceInfo',
        content: { id: '1234abc' },
    });
    const latest = {
        oss: '5.0.0',
        enterprise: '5.0.0',
    };
    fetchMock.mock(
        { url: testurl, method: 'POST' },
        {
            latest: false,
            versions: latest,
        },
    );
    const service = new VersionService(
        { settingStore },
        { getLogger, versionCheck: { url: testurl, enable: true } },
    );
    await service.checkLatestVersion();
    fetchMock.done();
    const versionInfo = service.getVersionInfo();
    expect(versionInfo.current.oss).toBe(version);
    expect(versionInfo.current.enterprise).toBeFalsy();
    expect(versionInfo.latest.oss).toBe(latest.oss);
    expect(versionInfo.latest.enterprise).toBe(latest.enterprise);
});

test('supports setting enterprise version as well', async () => {
    const testurl = `https://version.test${Math.random() * 1000}`;
    const { settingStore } = stores.createStores();
    const enterpriseVersion = '3.7.0';
    await settingStore.insert({
        name: 'instanceInfo',
        content: { id: '1234abc' },
    });
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    fetchMock.mock(
        { url: testurl, method: 'POST' },
        {
            latest: false,
            versions: latest,
        },
    );
    const service = new VersionService(
        { settingStore },
        {
            getLogger,
            versionCheck: { url: testurl, enable: true },
            version,
        },
        enterpriseVersion,
    );
    await service.checkLatestVersion();
    fetchMock.done();
    const versionInfo = service.getVersionInfo();
    expect(versionInfo.current.oss).toBe(version);
    expect(versionInfo.current.enterprise).toBe(enterpriseVersion);
    expect(versionInfo.latest.oss).toBe(latest.oss);
    expect(versionInfo.latest.enterprise).toBe(latest.enterprise);
});

test('if version check is not enabled should not make any calls', async () => {
    const testurl = `https://version.test${Math.random() * 1000}`;
    const { settingStore } = stores.createStores();
    const enterpriseVersion = '3.7.0';
    await settingStore.insert({
        name: 'instanceInfo',
        content: { id: '1234abc' },
    });
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    fetchMock.mock(
        { url: testurl, method: 'POST' },
        {
            latest: false,
            versions: latest,
        },
    );
    const service = new VersionService(
        { settingStore },
        {
            getLogger,
            versionCheck: { url: testurl, enable: false },
            version,
        },
        enterpriseVersion,
    );
    await service.checkLatestVersion();
    expect(fetchMock.called(testurl)).toBe(false);
    const versionInfo = service.getVersionInfo();
    expect(versionInfo.current.oss).toBe(version);
    expect(versionInfo.current.enterprise).toBe(enterpriseVersion);
    expect(versionInfo.latest.oss).toBeFalsy();
    expect(versionInfo.latest.enterprise).toBeFalsy();
});
