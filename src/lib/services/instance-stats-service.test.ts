import { createTestConfig } from '../../test/config/test-config';
import { InstanceStatsService } from './instance-stats-service';
import createStores from '../../test/fixtures/store';
import VersionService from './version-service';
import { minutesToMilliseconds } from 'date-fns';

jest.useFakeTimers();
let instanceStatsService: InstanceStatsService;
let versionService: VersionService;

beforeEach(() => {
    const config = createTestConfig();
    const stores = createStores();
    versionService = new VersionService(stores, config);
    instanceStatsService = new InstanceStatsService(
        stores,
        config,
        versionService,
    );

    jest.spyOn(instanceStatsService, 'refreshStatsSnapshot');
    jest.spyOn(instanceStatsService, 'getStats');

    // validate initial state without calls to these methods
    expect(instanceStatsService.refreshStatsSnapshot).toBeCalledTimes(0);
    expect(instanceStatsService.getStats).toBeCalledTimes(0);
});

test('starting instanceStatsService twice only sets one interval', async () => {
    jest.spyOn(global, 'setInterval');
    await instanceStatsService.start();
    await instanceStatsService.start();

    expect(setInterval).toBeCalledTimes(1);
});

test('snapshot behaves properly over time', async () => {
    await instanceStatsService.start();

    expect(instanceStatsService.refreshStatsSnapshot).toBeCalledTimes(1);
    expect(instanceStatsService.getStats).toBeCalledTimes(1);

    // since advancing jest timer doesn't really execut the internal promise:
    await instanceStatsService.refreshStatsSnapshot();
    expect(instanceStatsService.getStats).toBeCalledTimes(2);

    // subsequent calls to getStatsSnapshot don't call getStats
    for (let i = 0; i < 3; i++) {
        const stats = instanceStatsService.getStatsSnapshot();
        expect(stats.clientApps).toStrictEqual([
            { range: 'allTime', count: 0 },
            { range: '30d', count: 0 },
            { range: '7d', count: 0 },
        ]);
    }
    // after querying the stats snapshot no call to getStats should be issued
    expect(instanceStatsService.getStats).toBeCalledTimes(2);

    jest.advanceTimersByTime(minutesToMilliseconds(5) + 1);

    // after 5 minutes snapshot should have been refreshed
    expect(instanceStatsService.refreshStatsSnapshot).toBeCalledTimes(3);
    expect(instanceStatsService.getStats).toBeCalledTimes(3);
});

test('before the snapshot is refreshed we can still get the appCount', async () => {
    expect(instanceStatsService.refreshStatsSnapshot).toBeCalledTimes(0);
    expect(instanceStatsService.getAppCountSnapshot('7d')).toBeUndefined();
});
