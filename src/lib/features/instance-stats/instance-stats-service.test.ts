import { createTestConfig } from '../../../test/config/test-config';
import { InstanceStatsService } from './instance-stats-service';
import createStores from '../../../test/fixtures/store';
import VersionService from '../../services/version-service';
import { createFakeGetActiveUsers } from './getActiveUsers';
import { createFakeGetProductionChanges } from './getProductionChanges';

let instanceStatsService: InstanceStatsService;
let versionService: VersionService;

beforeEach(() => {
    const config = createTestConfig();
    const stores = createStores();
    versionService = new VersionService(
        stores,
        config,
        createFakeGetActiveUsers(),
        createFakeGetProductionChanges(),
    );
    instanceStatsService = new InstanceStatsService(
        stores,
        config,
        versionService,
        createFakeGetActiveUsers(),
        createFakeGetProductionChanges(),
    );

    jest.spyOn(instanceStatsService, 'refreshAppCountSnapshot');
    jest.spyOn(instanceStatsService, 'getLabeledAppCounts');
    jest.spyOn(instanceStatsService, 'getStats');

    // validate initial state without calls to these methods
    expect(instanceStatsService.refreshAppCountSnapshot).toHaveBeenCalledTimes(
        0,
    );
    expect(instanceStatsService.getStats).toHaveBeenCalledTimes(0);
});

test('get snapshot should not call getStats', async () => {
    await instanceStatsService.refreshAppCountSnapshot();
    expect(instanceStatsService.getLabeledAppCounts).toHaveBeenCalledTimes(1);
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
    expect(instanceStatsService.getLabeledAppCounts).toHaveBeenCalledTimes(1);
});

test('before the snapshot is refreshed we can still get the appCount', async () => {
    expect(instanceStatsService.refreshAppCountSnapshot).toHaveBeenCalledTimes(
        0,
    );
    expect(instanceStatsService.getAppCountSnapshot('7d')).toBeUndefined();
});
