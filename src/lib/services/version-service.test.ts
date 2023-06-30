import nock from 'nock';
import createStores from '../../test/fixtures/store';
import version from '../util/version';
import getLogger from '../../test/fixtures/no-logger';
import VersionService from './version-service';
import { v4 as uuidv4 } from 'uuid';
import { randomId } from '../util/random-id';

beforeAll(() => {
    nock.disableNetConnect();
});

afterAll(() => {
    nock.enableNetConnect();
});

test('yields current versions', async () => {
    const url = `https://${randomId()}.example.com`;
    const stores = createStores();
    await stores.settingStore.insert('instanceInfo', { id: '1234abc' });
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
    const service = new VersionService(stores, {
        getLogger,
        versionCheck: { url, enable: true },
        telemetry: true,
    });
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
    const stores = createStores();
    const enterpriseVersion = '3.7.0';
    await stores.settingStore.insert('instanceInfo', { id: '1234abc' });
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

    const service = new VersionService(stores, {
        getLogger,
        versionCheck: { url, enable: true },
        enterpriseVersion,
        telemetry: true,
    });
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
    const stores = createStores();
    const enterpriseVersion = '3.7.0';
    await stores.settingStore.insert('instanceInfo', { id: '1234abc' });
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

    const service = new VersionService(stores, {
        getLogger,
        versionCheck: { url, enable: false },
        enterpriseVersion,
        telemetry: true,
    });
    await service.checkLatestVersion();
    const versionInfo = service.getVersionInfo();
    expect(scope.isDone()).toEqual(false);
    expect(versionInfo.current.oss).toBe(version);
    expect(versionInfo.current.enterprise).toBe(enterpriseVersion);
    expect(versionInfo.latest.oss).toBeFalsy();
    expect(versionInfo.latest.enterprise).toBeFalsy();
    nock.cleanAll();
});

test('sets featureinfo', async () => {
    const url = `https://${randomId()}.example.com`;
    const stores = createStores();
    const enterpriseVersion = '4.0.0';
    await stores.settingStore.insert('instanceInfo', { id: '1234abc' });
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };

    const scope = nock(url)
        .post(
            '/',
            (body) =>
                body.featureInfo &&
                body.featureInfo.featureToggles === 0 &&
                body.featureInfo.environments === 0,
        )
        .reply(() => [
            200,
            JSON.stringify({
                latest: true,
                versions: latest,
            }),
        ]);

    const service = new VersionService(stores, {
        getLogger,
        versionCheck: { url, enable: true },
        enterpriseVersion,
        telemetry: true,
    });
    await service.checkLatestVersion();
    expect(scope.isDone()).toEqual(true);
    nock.cleanAll();
});

test('counts toggles', async () => {
    const url = `https://${randomId()}.example.com`;
    const stores = createStores();
    const enterpriseVersion = '4.0.0';
    await stores.settingStore.insert('instanceInfo', { id: '1234abc' });
    await stores.settingStore.insert('unleash.enterprise.auth.oidc', {
        enabled: true,
    });
    await stores.featureToggleStore.create('project', { name: uuidv4() });
    await stores.strategyStore.createStrategy({
        name: uuidv4(),
        editable: true,
    });
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };

    const scope = nock(url)
        .post(
            '/',
            (body) =>
                body.featureInfo &&
                body.featureInfo.featureToggles === 1 &&
                body.featureInfo.environments === 0 &&
                body.featureInfo.customStrategies === 1 &&
                body.featureInfo.customStrategiesInUse === 3 &&
                body.featureInfo.OIDCenabled,
        )
        .reply(() => [
            200,
            JSON.stringify({
                latest: true,
                versions: latest,
            }),
        ]);

    const service = new VersionService(stores, {
        getLogger,
        versionCheck: { url, enable: true },
        enterpriseVersion,
        telemetry: true,
    });
    await service.checkLatestVersion();
    expect(scope.isDone()).toEqual(true);
    nock.cleanAll();
});

test('counts custom strategies', async () => {
    const url = `https://${randomId()}.example.com`;
    const stores = createStores();
    const enterpriseVersion = '4.0.0';
    const strategyName = uuidv4();
    const toggleName = uuidv4();
    await stores.settingStore.insert('instanceInfo', { id: '1234abc' });
    await stores.settingStore.insert('unleash.enterprise.auth.oidc', {
        enabled: true,
    });
    await stores.featureToggleStore.create('project', { name: toggleName });
    await stores.strategyStore.createStrategy({
        name: strategyName,
        editable: true,
    });
    await stores.strategyStore.createStrategy({
        name: uuidv4(),
        editable: true,
    });
    await stores.featureStrategiesStore.createStrategyFeatureEnv({
        featureName: toggleName,
        projectId: 'project',
        environment: 'default',
        strategyName: strategyName,
        parameters: {},
        constraints: [],
    });
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };

    const scope = nock(url)
        .post(
            '/',
            (body) =>
                body.featureInfo &&
                body.featureInfo.featureToggles === 1 &&
                body.featureInfo.environments === 0 &&
                body.featureInfo.customStrategies === 2 &&
                body.featureInfo.customStrategiesInUse === 3 &&
                body.featureInfo.OIDCenabled,
        )
        .reply(() => [
            200,
            JSON.stringify({
                latest: true,
                versions: latest,
            }),
        ]);

    const service = new VersionService(stores, {
        getLogger,
        versionCheck: { url, enable: true },
        enterpriseVersion,
        telemetry: true,
    });
    await service.checkLatestVersion();
    expect(scope.isDone()).toEqual(true);
    nock.cleanAll();
});
