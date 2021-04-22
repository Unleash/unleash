const test = require('ava');
const proxyquire = require('proxyquire').noCallThru();
const fetchMock = require('fetch-mock').sandbox();
const stores = require('../../test/fixtures/store');
const getLogger = require('../../test/fixtures/no-logger');
const version = require('../util/version');

const VersionService = proxyquire('./version-service', {
    'node-fetch': fetchMock,
});

test.serial('yields current versions', async t => {
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
    t.is(versionInfo.current.oss, version);
    t.falsy(versionInfo.current.enterprise);
    t.is(versionInfo.latest.oss, latest.oss);
    t.is(versionInfo.latest.enterprise, latest.enterprise);
});

test.serial('supports setting enterprise version as well', async t => {
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
    t.is(versionInfo.current.oss, version);
    t.is(versionInfo.current.enterprise, enterpriseVersion);
    t.is(versionInfo.latest.oss, latest.oss);
    t.is(versionInfo.latest.enterprise, latest.enterprise);
});

test.serial(
    'if version check is not enabled should not make any calls',
    async t => {
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
        t.false(fetchMock.called(testurl));
        const versionInfo = service.getVersionInfo();
        t.is(versionInfo.current.oss, version);
        t.is(versionInfo.current.enterprise, enterpriseVersion);
        t.falsy(versionInfo.latest.oss, latest.oss);
        t.falsy(versionInfo.latest.enterprise, latest.enterprise);
    },
);
