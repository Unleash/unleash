import { createTestConfig } from '../../../test/config/test-config';
import { InstanceStatsService } from './instance-stats-service';
import createStores from '../../../test/fixtures/store';
import VersionService from '../../services/version-service';
import { createFakeGetActiveUsers } from './getActiveUsers';
import { createFakeGetProductionChanges } from './getProductionChanges';
import { registerPrometheusMetrics } from '../../metrics';
import { register } from 'prom-client';
import type { IClientInstanceStore } from '../../types';
let instanceStatsService: InstanceStatsService;
let versionService: VersionService;
let clientInstanceStore: IClientInstanceStore;

beforeEach(() => {
    register.clear();

    const config = createTestConfig();
    const stores = createStores();
    versionService = new VersionService(
        stores,
        config,
        createFakeGetActiveUsers(),
        createFakeGetProductionChanges(),
    );
    clientInstanceStore = stores.clientInstanceStore;
    instanceStatsService = new InstanceStatsService(
        stores,
        config,
        versionService,
        createFakeGetActiveUsers(),
        createFakeGetProductionChanges(),
    );

    registerPrometheusMetrics(
        config,
        stores,
        undefined as unknown as string,
        config.eventBus,
        instanceStatsService,
    );

    jest.spyOn(clientInstanceStore, 'getDistinctApplicationsCount');
    jest.spyOn(instanceStatsService, 'getStats');

    expect(instanceStatsService.getStats).toHaveBeenCalledTimes(0);
});

test('get snapshot should not call getStats', async () => {
    await instanceStatsService.dbMetrics.refreshDbMetrics();
    expect(
        clientInstanceStore.getDistinctApplicationsCount,
    ).toHaveBeenCalledTimes(3);
    expect(instanceStatsService.getStats).toHaveBeenCalledTimes(0);

    // subsequent calls to getStatsSnapshot don't call getStats
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
