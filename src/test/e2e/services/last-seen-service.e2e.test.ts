import { createTestConfig } from '../../config/test-config';
import dbInit from '../helpers/database-init';
import { IUnleashStores } from '../../../lib/types/stores';
import { LastSeenService } from '../../../lib/services/client-metrics/last-seen-service';
import { IClientMetricsEnv } from '../../../lib/types/stores/client-metrics-store-v2';
import { secondsToMilliseconds } from 'date-fns';

let stores: IUnleashStores;
let db;
let config;

beforeAll(async () => {
    config = createTestConfig();
    db = await dbInit('last_seen_service_serial', config.getLogger);
    stores = db.stores;
});
beforeEach(async () => {
    await stores.featureToggleStore.deleteAll();
});
afterAll(async () => {
    await db.destroy();
});

/**
 * A utility to wait for any pending promises in the test subject code.
 * For instance, if the test needs to wait for a timeout/interval handler,
 * and that handler does something async, advancing the timers is not enough:
 * We have to explicitly wait for the second promise.
 * For more info, see https://stackoverflow.com/a/51045733/2868829
 *
 * Usage in test code after advancing timers, but before making assertions:
 *
 * test('hello', async () => {
 *    jest.useFakeTimers('modern');
 *
 *    // Schedule a timeout with a callback that does something async
 *    // before calling our spy
 *    const spy = jest.fn();
 *    setTimeout(async () => {
 *        await Promise.resolve();
 *        spy();
 *    }, 1000);
 *
 *    expect(spy).not.toHaveBeenCalled();
 *
 *    jest.advanceTimersByTime(1500);
 *    await flushPromises(); // this is required to make it work!
 *
 *    expect(spy).toHaveBeenCalledTimes(1);
 *
 *    jest.useRealTimers();
 * });
 */
function flushPromises() {
    return Promise.resolve(setImmediate);
}

test('Should update last seen for known toggles after 30s', async () => {
    jest.useFakeTimers();
    const service = new LastSeenService(stores, config);
    const time = Date.now();
    await stores.featureToggleStore.create('default', { name: 'ta1' });

    const metrics: IClientMetricsEnv[] = [
        {
            featureName: 'ta1',
            appName: 'some-App',
            environment: 'default',
            timestamp: new Date(time),
            yes: 1,
            no: 0,
        },
        {
            featureName: 'ta2',
            appName: 'some-App',
            environment: 'default',
            timestamp: new Date(time),
            yes: 1,
            no: 0,
        },
    ];

    service.updateLastSeen(metrics);
    jest.advanceTimersByTime(secondsToMilliseconds(31));
    await flushPromises();

    const t1 = await stores.featureToggleStore.get('ta1');

    expect(t1.lastSeenAt.getTime()).toBeGreaterThan(time);

    service.destroy();

    jest.useRealTimers();
});

test('Should not update last seen toggles with 0 metrics', async () => {
    // jest.useFakeTimers();
    const service = new LastSeenService(stores, config, 30);
    const time = Date.now();
    await stores.featureToggleStore.create('default', { name: 'tb1' });
    await stores.featureToggleStore.create('default', { name: 'tb2' });

    const metrics: IClientMetricsEnv[] = [
        {
            featureName: 'tb1',
            appName: 'some-App',
            environment: 'default',
            timestamp: new Date(time),
            yes: 1,
            no: 0,
        },
        {
            featureName: 'tb2',
            appName: 'some-App',
            environment: 'default',
            timestamp: new Date(time),
            yes: 0,
            no: 0,
        },
    ];

    service.updateLastSeen(metrics);

    // bypass interval waiting
    await service.store();

    const t1 = await stores.featureToggleStore.get('tb1');
    const t2 = await stores.featureToggleStore.get('tb2');

    expect(t2.lastSeenAt).toBeNull();
    expect(t1.lastSeenAt.getTime()).toBeGreaterThan(time);

    service.destroy();
});

test('Should not update anything for 0 toggles', async () => {
    // jest.useFakeTimers();
    const service = new LastSeenService(stores, config, 30);
    const time = Date.now();
    await stores.featureToggleStore.create('default', { name: 'tb1' });
    await stores.featureToggleStore.create('default', { name: 'tb2' });

    const metrics: IClientMetricsEnv[] = [
        {
            featureName: 'tb1',
            appName: 'some-App',
            environment: 'default',
            timestamp: new Date(time),
            yes: 0,
            no: 0,
        },
        {
            featureName: 'tb2',
            appName: 'some-App',
            environment: 'default',
            timestamp: new Date(time),
            yes: 0,
            no: 0,
        },
    ];

    service.updateLastSeen(metrics);

    // bypass interval waiting
    const count = await service.store();

    expect(count).toBe(0);

    service.destroy();
});
