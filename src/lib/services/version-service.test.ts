import nock from 'nock';
import createStores from '../../test/fixtures/store';
import version from '../util/version';
import getLogger from '../../test/fixtures/no-logger';
import VersionService from './version-service';
import { v4 as uuidv4 } from 'uuid';
import { randomId } from '../util/random-id';
import { createFakeGetActiveUsers } from '../features/instance-stats/getActiveUsers';
import { createFakeGetProductionChanges } from '../features/instance-stats/getProductionChanges';

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
    const service = new VersionService(
        stores,
        {
            getLogger,
            versionCheck: { url, enable: true },
            telemetry: true,
        },
        createFakeGetActiveUsers(),
        createFakeGetProductionChanges(),
    );
    await service.checkLatestVersion();
    const versionInfo = await service.getVersionInfo();
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

    const service = new VersionService(
        stores,
        {
            getLogger,
            versionCheck: { url, enable: true },
            enterpriseVersion,
            telemetry: true,
        },
        createFakeGetActiveUsers(),
        createFakeGetProductionChanges(),
    );
    await service.checkLatestVersion();
    const versionInfo = await service.getVersionInfo();
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

    const service = new VersionService(
        stores,
        {
            getLogger,
            versionCheck: { url, enable: false },
            enterpriseVersion,
            telemetry: true,
        },
        createFakeGetActiveUsers(),
        createFakeGetProductionChanges(),
    );
    await service.checkLatestVersion();
    const versionInfo = await service.getVersionInfo();
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

    const service = new VersionService(
        stores,
        {
            getLogger,
            versionCheck: { url, enable: true },
            enterpriseVersion,
            telemetry: true,
        },
        createFakeGetActiveUsers(),
        createFakeGetProductionChanges(),
    );
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
    await stores.featureToggleStore.create('project', {
        name: uuidv4(),
        createdByUserId: 9999,
    });
    await stores.strategyStore.createStrategy({
        name: uuidv4(),
        editable: true,
        parameters: [],
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

    const service = new VersionService(
        stores,
        {
            getLogger,
            versionCheck: { url, enable: true },
            enterpriseVersion,
            telemetry: true,
        },
        createFakeGetActiveUsers(),
        createFakeGetProductionChanges(),
    );
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
    await stores.featureToggleStore.create('project', {
        name: toggleName,
        createdByUserId: 9999,
    });
    await stores.strategyStore.createStrategy({
        name: strategyName,
        editable: true,
        parameters: [],
    });
    await stores.strategyStore.createStrategy({
        name: uuidv4(),
        editable: true,
        parameters: [],
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

    const service = new VersionService(
        stores,
        {
            getLogger,
            versionCheck: { url, enable: true },
            enterpriseVersion,
            telemetry: true,
        },
        createFakeGetActiveUsers(),
        createFakeGetProductionChanges(),
    );
    await service.checkLatestVersion();
    expect(scope.isDone()).toEqual(true);
    nock.cleanAll();
});

test('counts active users', async () => {
    const url = `https://${randomId()}.example.com`;
    const stores = createStores();
    const enterpriseVersion = '4.0.0';
    await stores.settingStore.insert('instanceInfo', { id: '1234abc' });
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    const fakeActiveUsers = createFakeGetActiveUsers({
        last7: 2,
        last30: 5,
        last60: 10,
        last90: 20,
    });
    const fakeProductionChanges = createFakeGetProductionChanges();
    const scope = nock(url)
        .post(
            '/',
            (body) =>
                body.featureInfo &&
                body.featureInfo.activeUsers30 === 5 &&
                body.featureInfo.activeUsers60 === 10 &&
                body.featureInfo.activeUsers90 === 20,
        )
        .reply(() => [
            200,
            JSON.stringify({
                latest: true,
                versions: latest,
            }),
        ]);

    const service = new VersionService(
        stores,
        {
            getLogger,
            versionCheck: { url, enable: true },
            enterpriseVersion,
            telemetry: true,
        },
        fakeActiveUsers,
        fakeProductionChanges,
    );
    await service.checkLatestVersion();
    expect(scope.isDone()).toEqual(true);
    nock.cleanAll();
});
test('Counts production changes', async () => {
    const url = `https://${randomId()}.example.com`;
    const stores = createStores();
    const enterpriseVersion = '4.0.0';
    await stores.settingStore.insert('instanceInfo', { id: '1234abc' });
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    const fakeActiveUsers = createFakeGetActiveUsers();
    const fakeProductionChanges = createFakeGetProductionChanges({
        last30: 5,
        last60: 10,
        last90: 20,
    });
    const scope = nock(url)
        .post(
            '/',
            (body) =>
                body.featureInfo &&
                body.featureInfo.productionChanges30 === 5 &&
                body.featureInfo.productionChanges60 === 10 &&
                body.featureInfo.productionChanges90 === 20,
        )
        .reply(() => [
            200,
            JSON.stringify({
                latest: true,
                versions: latest,
            }),
        ]);

    const service = new VersionService(
        stores,
        {
            getLogger,
            versionCheck: { url, enable: true },
            enterpriseVersion,
            telemetry: true,
        },
        fakeActiveUsers,
        fakeProductionChanges,
    );
    await service.checkLatestVersion();
    expect(scope.isDone()).toEqual(true);
    nock.cleanAll();
});
