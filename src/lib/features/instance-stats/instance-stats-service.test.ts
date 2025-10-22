import { createTestConfig } from '../../../test/config/test-config.js';
import { InstanceStatsService } from './instance-stats-service.js';
import createStores from '../../../test/fixtures/store.js';
import VersionService from '../../services/version-service.js';
import { createFakeGetActiveUsers } from './getActiveUsers.js';
import { createFakeGetProductionChanges } from './getProductionChanges.js';
import { registerPrometheusMetrics } from '../../metrics.js';
import { register } from 'prom-client';
import type {
    IClientInstanceStore,
    IFlagResolver,
    IUnleashStores,
} from '../../types/index.js';
import { createFakeGetLicensedUsers } from './getLicensedUsers.js';
import { vi } from 'vitest';
import { DEFAULT_ENV } from '../../server-impl.js';
import { createFakeGetEdgeInstances } from './getEdgeInstances.js';

let instanceStatsService: InstanceStatsService;
let versionService: VersionService;
let clientInstanceStore: IClientInstanceStore;
let stores: IUnleashStores;
let flagResolver: IFlagResolver;

let updateMetrics: () => Promise<void>;
beforeEach(() => {
    vi.clearAllMocks();

    register.clear();

    const config = createTestConfig();
    flagResolver = config.flagResolver;
    stores = createStores();
    versionService = new VersionService(stores, config);
    clientInstanceStore = stores.clientInstanceStore;
    instanceStatsService = new InstanceStatsService(
        stores,
        config,
        versionService,
        createFakeGetActiveUsers(),
        createFakeGetProductionChanges(),
        createFakeGetLicensedUsers(),
        createFakeGetEdgeInstances(),
    );

    const { collectAggDbMetrics } = registerPrometheusMetrics(
        config,
        stores,
        undefined as unknown as string,
        config.eventBus,
        instanceStatsService,
    );
    updateMetrics = collectAggDbMetrics;

    vi.spyOn(clientInstanceStore, 'getDistinctApplicationsCount');
    vi.spyOn(instanceStatsService, 'getStats');

    expect(instanceStatsService.getStats).toHaveBeenCalledTimes(0);
});

test('get snapshot should not call getStats', async () => {
    await updateMetrics();
    expect(
        clientInstanceStore.getDistinctApplicationsCount,
    ).toHaveBeenCalledTimes(3);
    expect(instanceStatsService.getStats).toHaveBeenCalledTimes(0);

    for (let i = 0; i < 3; i++) {
        const { clientApps } = await instanceStatsService.getStats();
        expect(clientApps).toStrictEqual([
            { count: 0, range: '7d' },
            { count: 0, range: '30d' },
            { count: 0, range: 'allTime' },
        ]);
    }
    // after querying the stats snapshot no call to getStats should be issued
    expect(
        clientInstanceStore.getDistinctApplicationsCount,
    ).toHaveBeenCalledTimes(3);
});

test('before the snapshot is refreshed we can still get the appCount', async () => {
    expect(instanceStatsService.getAppCountSnapshot('7d')).toBeUndefined();
});

describe.each([true, false])(
    'When feature enabled is %s',
    (featureEnabled: boolean) => {
        beforeEach(() => {
            vi.spyOn(flagResolver, 'getVariant').mockReturnValue({
                name: 'memorizeStats',
                enabled: featureEnabled,
                feature_enabled: featureEnabled,
            });
        });

        test(`should${featureEnabled ? ' ' : ' not '}memoize query results`, async () => {
            const segmentStore = stores.segmentStore;
            vi.spyOn(segmentStore, 'count').mockReturnValue(Promise.resolve(5));
            expect(segmentStore.count).toHaveBeenCalledTimes(0);
            expect(await instanceStatsService.segmentCount()).toBe(5);
            expect(segmentStore.count).toHaveBeenCalledTimes(1);
            expect(await instanceStatsService.segmentCount()).toBe(5);
            expect(segmentStore.count).toHaveBeenCalledTimes(
                featureEnabled ? 1 : 2,
            );
        });

        test(`should${featureEnabled ? ' ' : ' not '}memoize async query results`, async () => {
            const trafficDataUsageStore = stores.trafficDataUsageStore;
            vi.spyOn(
                trafficDataUsageStore,
                'getTrafficDataUsageForPeriod',
            ).mockReturnValue(
                Promise.resolve([
                    {
                        day: new Date(),
                        trafficGroup: 'default',
                        statusCodeSeries: 200,
                        count: 5,
                    },
                    {
                        day: new Date(),
                        trafficGroup: 'default',
                        statusCodeSeries: 400,
                        count: 2,
                    },
                ]),
            );
            expect(
                trafficDataUsageStore.getTrafficDataUsageForPeriod,
            ).toHaveBeenCalledTimes(0);
            expect(await instanceStatsService.getCurrentTrafficData()).toBe(7);
            expect(
                trafficDataUsageStore.getTrafficDataUsageForPeriod,
            ).toHaveBeenCalledTimes(1);
            expect(await instanceStatsService.getCurrentTrafficData()).toBe(7);
            expect(
                trafficDataUsageStore.getTrafficDataUsageForPeriod,
            ).toHaveBeenCalledTimes(featureEnabled ? 1 : 2);
        });

        test(`getStats should${featureEnabled ? ' ' : ' not '}be memorized`, async () => {
            const featureStrategiesReadModel =
                stores.featureStrategiesReadModel;
            vi.spyOn(
                featureStrategiesReadModel,
                'getMaxFeatureEnvironmentStrategies',
            ).mockReturnValue(
                Promise.resolve({
                    feature: 'x',
                    environment: DEFAULT_ENV,
                    count: 3,
                }),
            );
            expect(
                featureStrategiesReadModel.getMaxFeatureEnvironmentStrategies,
            ).toHaveBeenCalledTimes(0);
            expect(
                (await instanceStatsService.getStats())
                    .maxEnvironmentStrategies,
            ).toBe(3);
            expect(
                featureStrategiesReadModel.getMaxFeatureEnvironmentStrategies,
            ).toHaveBeenCalledTimes(1);
            expect(
                (await instanceStatsService.getStats())
                    .maxEnvironmentStrategies,
            ).toBe(3);
            expect(
                featureStrategiesReadModel.getMaxFeatureEnvironmentStrategies,
            ).toHaveBeenCalledTimes(featureEnabled ? 1 : 2);
        });
    },
);
