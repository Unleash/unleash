import nock from 'nock';
import createStores from '../../test/fixtures/store.js';
import version from '../util/version.js';
import getLogger from '../../test/fixtures/no-logger.js';
import VersionService, { type IInstanceInfo } from './version-service.js';
import { randomId } from '../util/random-id.js';

beforeAll(() => {
    nock.disableNetConnect();
});

afterAll(() => {
    nock.enableNetConnect();
});

const fakeTelemetryData = {
    featureToggles: 0,
    users: 0,
    projects: 1,
    contextFields: 3,
    groups: 0,
    roles: 5,
    customRootRoles: 0,
    customRootRolesInUse: 0,
    environments: 1,
    segments: 0,
    strategies: 3,
    SAMLenabled: false,
    OIDCenabled: false,
    featureExports: 0,
    featureImports: 0,
    customStrategies: 3,
    customStrategiesInUse: 0,
    instanceId: '1460588e-d5f4-4ac2-9962-c8631f6b8dad',
    versionOSS: '6.4.1',
    versionEnterprise: '',
    activeUsers30: 0,
    activeUsers60: 0,
    activeUsers90: 0,
    productionChanges30: 0,
    productionChanges60: 0,
    productionChanges90: 0,
    postgresVersion: '17.1 (Debian 17.1-1.pgdg120+1)',
    licenseType: 'test',
    hostedBy: 'self-hosted',
    releaseTemplates: 2,
    releasePlans: 4,
    edgeInstanceUsage: {},
};

test('yields current versions', async () => {
    const url = `https://${randomId()}.example.com`;
    const stores = createStores();
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
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
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
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
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
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
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
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };

    const scope = nock(url)
        .post(
            '/',
            (body) =>
                body.featureInfo &&
                body.featureInfo.featureToggles ===
                    fakeTelemetryData.featureToggles &&
                body.featureInfo.environments ===
                    fakeTelemetryData.environments,
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
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
    expect(scope.isDone()).toEqual(true);
    nock.cleanAll();
});

test('counts toggles', async () => {
    const url = `https://${randomId()}.example.com`;
    const stores = createStores();
    const enterpriseVersion = '4.0.0';
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };

    const scope = nock(url)
        .post(
            '/',
            (body) =>
                body.featureInfo &&
                body.featureInfo.featureToggles ===
                    fakeTelemetryData.featureToggles &&
                body.featureInfo.environments ===
                    fakeTelemetryData.environments &&
                body.featureInfo.customStrategies ===
                    fakeTelemetryData.customStrategies &&
                body.featureInfo.customStrategiesInUse ===
                    fakeTelemetryData.customRootRolesInUse &&
                body.featureInfo.OIDCenabled === fakeTelemetryData.OIDCenabled,
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
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
    expect(scope.isDone()).toEqual(true);
    nock.cleanAll();
});

test('counts custom strategies', async () => {
    const url = `https://${randomId()}.example.com`;
    const stores = createStores();
    const enterpriseVersion = '4.0.0';

    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };

    const scope = nock(url)
        .post(
            '/',
            (body) =>
                body.featureInfo &&
                body.featureInfo.featureToggles ===
                    fakeTelemetryData.featureToggles &&
                body.featureInfo.environments ===
                    fakeTelemetryData.environments &&
                body.featureInfo.customStrategies ===
                    fakeTelemetryData.customStrategies &&
                body.featureInfo.customStrategiesInUse ===
                    fakeTelemetryData.customRootRolesInUse &&
                body.featureInfo.OIDCenabled === fakeTelemetryData.OIDCenabled,
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
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
    expect(scope.isDone()).toEqual(true);
    nock.cleanAll();
});

test('counts active users', async () => {
    const url = `https://${randomId()}.example.com`;
    const stores = createStores();
    const enterpriseVersion = '4.0.0';
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };

    const scope = nock(url)
        .post(
            '/',
            (body) =>
                body.featureInfo &&
                body.featureInfo.activeUsers30 ===
                    fakeTelemetryData.activeUsers30 &&
                body.featureInfo.activeUsers60 ===
                    fakeTelemetryData.activeUsers60 &&
                body.featureInfo.activeUsers90 ===
                    fakeTelemetryData.activeUsers90,
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
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
    expect(scope.isDone()).toEqual(true);
    nock.cleanAll();
});
test('Counts production changes', async () => {
    const url = `https://${randomId()}.example.com`;
    const stores = createStores();
    const enterpriseVersion = '4.0.0';
    const latest = {
        oss: '4.0.0',
        enterprise: '4.0.0',
    };
    const scope = nock(url)
        .post(
            '/',
            (body) =>
                body.featureInfo &&
                body.featureInfo.productionChanges30 ===
                    fakeTelemetryData.productionChanges30 &&
                body.featureInfo.productionChanges60 ===
                    fakeTelemetryData.productionChanges60 &&
                body.featureInfo.productionChanges90 ===
                    fakeTelemetryData.productionChanges90,
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
    await service.checkLatestVersion(() => Promise.resolve(fakeTelemetryData));
    expect(scope.isDone()).toEqual(true);
    nock.cleanAll();
});

describe('instance info reading', () => {
    test('it sets instance info if the instanceInfoProvider promise returns a truthy value', async () => {
        const instanceInfo: IInstanceInfo = {
            customerPlan: 'Test Plan',
            customerName: 'Test Company',
            clientId: 'Test Id',
        };

        const url = `https://${randomId()}.example.com`;
        const scope = nock(url)
            .post(
                '/',
                (body) =>
                    body.instanceInfo &&
                    body.instanceInfo.customerPlan ===
                        instanceInfo.customerPlan &&
                    body.instanceInfo.customerName ===
                        instanceInfo.customerName &&
                    body.instanceInfo.clientId === instanceInfo.clientId,
            )
            .reply(() => [200]);

        const stores = createStores();
        const service = new VersionService(stores, {
            getLogger,
            versionCheck: { url, enable: true },
            telemetry: true,
        });
        await service.checkLatestVersion(
            () => Promise.resolve(fakeTelemetryData),
            () => Promise.resolve(instanceInfo),
        );
        expect(scope.isDone()).toEqual(true);
    });

    test.each([
        ['is undefined', undefined],
        ['returns undefined', () => Promise.resolve(undefined)],
    ])('it does not set instance info if the instanceInfoProvider promise %s', async (_, instanceInfoProvider) => {
        const url = `https://${randomId()}.example.com`;
        const scope = nock(url)
            .post('/', (body) => body.instanceInfo === undefined)
            .reply(() => [200]);

        const stores = createStores();
        const service = new VersionService(stores, {
            getLogger,
            versionCheck: { url, enable: true },
            telemetry: true,
        });
        await service.checkLatestVersion(
            () => Promise.resolve(fakeTelemetryData),
            instanceInfoProvider,
        );
        expect(scope.isDone()).toEqual(true);
    });
});
