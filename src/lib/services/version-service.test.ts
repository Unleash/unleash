import nock from 'nock';
import createStores from '../../test/fixtures/store';
import version from '../util/version';
import getLogger from '../../test/fixtures/no-logger';
import VersionService from './version-service';
import { randomId } from '../util/random-id';

beforeAll(() => {
    nock.disableNetConnect();
});

afterAll(() => {
    nock.enableNetConnect();
});

test('yields current versions', async () => {
    const url = `https://${randomId()}.example.com`;
    const { settingStore } = createStores();
    await settingStore.insert('instanceInfo', { id: '1234abc' });
    const latest = {
        oss: '5.0.0',
        enterprise: '5.0.0',
    };
    const scope = nock(url)
        .post('/')
        .reply(() => [
            200,
            JSON.stringify({
                latest: false,
                versions: latest,
            }),
        ]);
    const service = new VersionService(
        { settingStore },
        {
            getLogger,
            versionCheck: { url, enable: true },
        },
    );
    await service.checkLatestVersion();
    const versionInfo = service.getVersionInfo();
    expect(scope.isDone()).toEqual(true);
    expect(versionInfo.current.oss).toBe(version);
    expect(versionInfo.current.enterprise).toBeFalsy();
    expect(versionInfo.latest.oss).toBe(latest.oss);
    expect(versionInfo.latest.enterprise).toBe(latest.enterprise);
});

test('supports setting enterprise version as well', async () => {
    const url = `https://${randomId()}.example.com`;
    const { settingStore } = createStores();
    const enterpriseVersion = '3.7.0';
    await settingStore.insert('instanceInfo', { id: '1234abc' });
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    const scope = nock(url)
        .post('/')
        .reply(() => [
            200,
            JSON.stringify({
                latest: false,
                versions: latest,
            }),
        ]);

    const service = new VersionService(
        { settingStore },
        {
            getLogger,
            versionCheck: { url, enable: true },
            enterpriseVersion,
        },
    );
    await service.checkLatestVersion();
    const versionInfo = service.getVersionInfo();
    expect(scope.isDone()).toEqual(true);
    expect(versionInfo.current.oss).toBe(version);
    expect(versionInfo.current.enterprise).toBe(enterpriseVersion);
    expect(versionInfo.latest.oss).toBe(latest.oss);
    expect(versionInfo.latest.enterprise).toBe(latest.enterprise);
});

test('if version check is not enabled should not make any calls', async () => {
    const url = `https://${randomId()}.example.com`;
    const { settingStore } = createStores();
    const enterpriseVersion = '3.7.0';
    await settingStore.insert('instanceInfo', { id: '1234abc' });
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    const scope = nock(url)
        .get('/')
        .reply(() => [
            200,
            JSON.stringify({
                latest: false,
                versions: latest,
            }),
        ]);

    const service = new VersionService(
        { settingStore },
        {
            getLogger,
            versionCheck: { url, enable: false },
            enterpriseVersion,
        },
    );
    await service.checkLatestVersion();
    const versionInfo = service.getVersionInfo();
    expect(scope.isDone()).toEqual(false);
    expect(versionInfo.current.oss).toBe(version);
    expect(versionInfo.current.enterprise).toBe(enterpriseVersion);
    expect(versionInfo.latest.oss).toBeFalsy();
    expect(versionInfo.latest.enterprise).toBeFalsy();
    nock.cleanAll();
});
