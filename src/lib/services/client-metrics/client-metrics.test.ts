import EventEmitter from 'events';
import ClientMetricsService from './index';
import getLogger from '../../../test/fixtures/no-logger';
import { IClientApp } from '../../types/model';
import {
    addHours,
    addMinutes,
    millisecondsInHour,
    millisecondsInMinute,
    minutesToMilliseconds,
    secondsToMilliseconds,
    subHours,
    subMinutes,
    subSeconds,
} from 'date-fns';

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

const appName = 'appName';
const instanceId = 'instanceId';

const createMetricsService = (cms) =>
    new ClientMetricsService(
        {
            clientMetricsStore: cms,
            strategyStore: null,
            featureToggleStore: null,
            clientApplicationsStore: null,
            clientInstanceStore: null,
            eventStore: null,
        },
        { getLogger },
    );

test('should work without state', () => {
    const clientMetricsStore = new EventEmitter();
    const metrics = createMetricsService(clientMetricsStore);

    expect(metrics.getAppsWithToggles()).toBeTruthy();
    expect(metrics.getTogglesMetrics()).toBeTruthy();

    metrics.destroy();
});

test('data should expire', () => {
    jest.useFakeTimers('modern');

    const clientMetricsStore = new EventEmitter();
    const metrics = createMetricsService(clientMetricsStore);

    metrics.addPayload({
        appName,
        instanceId,
        bucket: {
            start: subSeconds(Date.now(), 2),
            stop: subSeconds(Date.now(), 1),
            toggles: {
                toggleX: {
                    yes: 123,
                    no: 0,
                },
            },
        },
    });

    let lastHourExpires = 0;
    metrics.lastHourList.on('expire', () => {
        lastHourExpires++;
    });

    let lastMinExpires = 0;
    metrics.lastMinuteList.on('expire', () => {
        lastMinExpires++;
    });

    jest.advanceTimersByTime(millisecondsInMinute);
    expect(lastMinExpires).toBe(1);
    expect(lastHourExpires).toBe(0);

    jest.advanceTimersByTime(millisecondsInHour);
    expect(lastMinExpires).toBe(1);
    expect(lastHourExpires).toBe(1);

    jest.useRealTimers();
    metrics.destroy();
});

test('should listen to metrics from store', () => {
    const clientMetricsStore = new EventEmitter();
    const metrics = createMetricsService(clientMetricsStore);
    clientMetricsStore.emit('metrics', {
        appName,
        instanceId,
        bucket: {
            start: new Date(),
            stop: new Date(),
            toggles: {
                toggleX: {
                    yes: 123,
                    no: 0,
                },
            },
        },
    });

    expect(metrics.apps[appName].count).toBe(123);
    expect(metrics.globalCount).toBe(123);

    expect(metrics.getTogglesMetrics().lastHour.toggleX).toEqual({
        yes: 123,
        no: 0,
    });
    expect(metrics.getTogglesMetrics().lastMinute.toggleX).toEqual({
        yes: 123,
        no: 0,
    });

    metrics.addPayload({
        appName,
        instanceId,
        bucket: {
            start: new Date(),
            stop: new Date(),
            toggles: {
                toggleX: {
                    yes: 10,
                    no: 10,
                },
            },
        },
    });

    expect(metrics.globalCount).toBe(143);
    expect(metrics.getTogglesMetrics().lastHour.toggleX).toEqual({
        yes: 133,
        no: 10,
    });
    expect(metrics.getTogglesMetrics().lastMinute.toggleX).toEqual({
        yes: 133,
        no: 10,
    });

    metrics.destroy();
});

test('should build up list of seen toggles when new metrics arrives', () => {
    const clientMetricsStore = new EventEmitter();
    const metrics = createMetricsService(clientMetricsStore);
    clientMetricsStore.emit('metrics', {
        appName,
        instanceId,
        bucket: {
            start: new Date(),
            stop: new Date(),
            toggles: {
                toggleX: {
                    yes: 123,
                    no: 0,
                },
                toggleY: {
                    yes: 50,
                    no: 50,
                },
            },
        },
    });

    const appToggles = metrics.getAppsWithToggles();
    const togglesForApp = metrics.getSeenTogglesByAppName(appName);

    expect(appToggles.length).toBe(1);
    expect(appToggles[0].seenToggles.length).toBe(2);
    expect(appToggles[0].seenToggles).toContain('toggleX');
    expect(appToggles[0].seenToggles).toContain('toggleY');

    expect(togglesForApp.length === 2);
    expect(togglesForApp).toContain('toggleX');
    expect(togglesForApp).toContain('toggleY');
    metrics.destroy();
});

test('should handle a lot of toggles', () => {
    const clientMetricsStore = new EventEmitter();
    const metrics = createMetricsService(clientMetricsStore);

    const toggleCounts = {};
    for (let i = 0; i < 100; i++) {
        toggleCounts[`toggle${i}`] = { yes: i, no: i };
    }

    clientMetricsStore.emit('metrics', {
        appName,
        instanceId,
        bucket: {
            start: new Date(),
            stop: new Date(),
            toggles: toggleCounts,
        },
    });

    const seenToggles = metrics.getSeenTogglesByAppName(appName);

    expect(seenToggles.length).toBe(100);
    metrics.destroy();
});

test('should have correct values for lastMinute', () => {
    jest.useFakeTimers('modern');

    const clientMetricsStore = new EventEmitter();
    const metrics = createMetricsService(clientMetricsStore);

    const now = new Date();
    const input = [
        {
            start: subHours(now, 1),
            stop: subMinutes(now, 59),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
        {
            start: subMinutes(now, 30),
            stop: subMinutes(now, 29),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
        {
            start: subMinutes(now, 2),
            stop: subMinutes(now, 1),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
        {
            start: subMinutes(now, 2),
            stop: subSeconds(now, 59),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
        {
            start: now,
            stop: subSeconds(now, 30),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
    ];

    input.forEach((bucket) => {
        clientMetricsStore.emit('metrics', {
            appName,
            instanceId,
            bucket,
        });
    });

    const seenToggles = metrics.getSeenTogglesByAppName(appName);
    expect(seenToggles.length).toBe(1);

    // metrics.se
    let c = metrics.getTogglesMetrics();
    expect(c.lastMinute.toggle).toEqual({ yes: 20, no: 20 });

    jest.advanceTimersByTime(secondsToMilliseconds(10));
    c = metrics.getTogglesMetrics();
    expect(c.lastMinute.toggle).toEqual({ yes: 10, no: 10 });

    jest.advanceTimersByTime(secondsToMilliseconds(20));
    c = metrics.getTogglesMetrics();
    expect(c.lastMinute.toggle).toEqual({ yes: 0, no: 0 });

    metrics.destroy();
    jest.useRealTimers();
});

test('should have correct values for lastHour', () => {
    jest.useFakeTimers('modern');

    const clientMetricsStore = new EventEmitter();
    const metrics = createMetricsService(clientMetricsStore);

    const now = Date.now();
    const input = [
        {
            start: subHours(now, 1),
            stop: subMinutes(now, 59),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
        {
            start: subMinutes(now, 30),
            stop: subMinutes(now, 29),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
        {
            start: subMinutes(now, 15),
            stop: subMinutes(now, 14),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
        {
            start: addMinutes(now, 59),
            stop: addHours(now, 1),
            toggles: {
                toggle: { yes: 11, no: 11 },
            },
        },
    ];

    input.forEach((bucket) => {
        clientMetricsStore.emit('metrics', {
            appName,
            instanceId,
            bucket,
        });
    });

    const seenToggles = metrics.getSeenTogglesByAppName(appName);

    expect(seenToggles.length).toBe(1);

    // metrics.se
    let c = metrics.getTogglesMetrics();
    expect(c.lastHour.toggle).toEqual({ yes: 41, no: 41 });

    jest.advanceTimersByTime(secondsToMilliseconds(10));
    c = metrics.getTogglesMetrics();
    expect(c.lastHour.toggle).toEqual({ yes: 41, no: 41 });

    // at 30
    jest.advanceTimersByTime(minutesToMilliseconds(30));
    c = metrics.getTogglesMetrics();
    expect(c.lastHour.toggle).toEqual({ yes: 31, no: 31 });

    // at 45
    jest.advanceTimersByTime(minutesToMilliseconds(15));
    c = metrics.getTogglesMetrics();
    expect(c.lastHour.toggle).toEqual({ yes: 21, no: 21 });

    // at 1:15
    jest.advanceTimersByTime(minutesToMilliseconds(30));
    c = metrics.getTogglesMetrics();
    expect(c.lastHour.toggle).toEqual({ yes: 11, no: 11 });

    // at 2:00
    jest.advanceTimersByTime(minutesToMilliseconds(45));
    c = metrics.getTogglesMetrics();
    expect(c.lastHour.toggle).toEqual({ yes: 0, no: 0 });

    metrics.destroy();
    jest.useRealTimers();
});

test('should not fail when toggle metrics is missing yes/no field', () => {
    const clientMetricsStore = new EventEmitter();
    const metrics = createMetricsService(clientMetricsStore);
    clientMetricsStore.emit('metrics', {
        appName,
        instanceId,
        bucket: {
            start: new Date(),
            stop: new Date(),
            toggles: {
                toggleX: {
                    yes: 123,
                    no: 0,
                },
            },
        },
    });

    metrics.addPayload({
        appName,
        instanceId,
        bucket: {
            start: new Date(),
            stop: new Date(),
            toggles: {
                toggleX: {
                    blue: 10,
                    green: 10,
                },
            },
        },
    });

    expect(metrics.globalCount).toBe(123);
    expect(metrics.getTogglesMetrics().lastMinute.toggleX).toEqual({
        yes: 123,
        no: 0,
    });

    metrics.destroy();
});

test('Multiple registrations of same appname and instanceid within same time period should only cause one registration', async () => {
    jest.useFakeTimers('modern');
    const clientMetricsStore: any = new EventEmitter();
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore: any = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore: any = {
        bulkUpsert: bulkSpy,
    };
    const clientMetrics = new ClientMetricsService(
        {
            clientMetricsStore,
            strategyStore: null,
            featureToggleStore: null,
            clientApplicationsStore,
            clientInstanceStore,
            eventStore: null,
        },
        { getLogger },
    );
    const client1: IClientApp = {
        appName: 'test_app',
        instanceId: 'ava',
        strategies: [{ name: 'defaullt' }],
        started: new Date(),
        interval: 10,
    };
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    jest.advanceTimersByTime(secondsToMilliseconds(7));
    await flushPromises();

    expect(appStoreSpy).toHaveBeenCalledTimes(1);
    expect(bulkSpy).toHaveBeenCalledTimes(1);

    const registrations = appStoreSpy.mock.calls[0][0];

    expect(registrations.length).toBe(1);
    expect(registrations[0].appName).toBe(client1.appName);
    expect(registrations[0].instanceId).toBe(client1.instanceId);
    expect(registrations[0].started).toBe(client1.started);
    expect(registrations[0].interval).toBe(client1.interval);

    jest.useRealTimers();
});

test('Multiple unique clients causes multiple registrations', async () => {
    jest.useFakeTimers('modern');
    const clientMetricsStore: any = new EventEmitter();
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore: any = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore: any = {
        bulkUpsert: bulkSpy,
    };

    const clientMetrics = new ClientMetricsService(
        {
            clientMetricsStore,
            strategyStore: null,
            featureToggleStore: null,
            clientApplicationsStore,
            clientInstanceStore,
            eventStore: null,
        },
        { getLogger },
    );
    const client1 = {
        appName: 'test_app',
        instanceId: 'client1',
        strategies: [{ name: 'defaullt' }],
        started: new Date(),
        interval: 10,
    };
    const client2 = {
        appName: 'test_app_2',
        instanceId: 'client2',
        strategies: [{ name: 'defaullt' }],
        started: new Date(),
        interval: 10,
    };
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client2, '127.0.0.1');
    await clientMetrics.registerClient(client2, '127.0.0.1');
    await clientMetrics.registerClient(client2, '127.0.0.1');

    jest.advanceTimersByTime(secondsToMilliseconds(7));
    await flushPromises();

    const registrations = appStoreSpy.mock.calls[0][0];

    expect(registrations.length).toBe(2);
    jest.useRealTimers();
});
test('Same client registered outside of dedup interval will be registered twice', async () => {
    jest.useFakeTimers('modern');
    const clientMetricsStore: any = new EventEmitter();
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore: any = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore: any = {
        bulkUpsert: bulkSpy,
    };

    const bulkInterval = secondsToMilliseconds(2);

    const clientMetrics = new ClientMetricsService(
        {
            clientMetricsStore,
            strategyStore: null,
            featureToggleStore: null,
            clientApplicationsStore,
            clientInstanceStore,
            eventStore: null,
        },
        { getLogger },
        bulkInterval,
    );
    const client1 = {
        appName: 'test_app',
        instanceId: 'client1',
        strategies: [{ name: 'defaullt' }],
        started: new Date(),
        interval: 10,
    };
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');

    jest.advanceTimersByTime(secondsToMilliseconds(3));

    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');

    jest.advanceTimersByTime(secondsToMilliseconds(3));
    await flushPromises();

    expect(appStoreSpy).toHaveBeenCalledTimes(2);
    expect(bulkSpy).toHaveBeenCalledTimes(2);

    const firstRegistrations = appStoreSpy.mock.calls[0][0][0];
    const secondRegistrations = appStoreSpy.mock.calls[1][0][0];

    expect(firstRegistrations.appName).toBe(secondRegistrations.appName);
    expect(firstRegistrations.instanceId).toBe(secondRegistrations.instanceId);
    jest.useRealTimers();
});

test('No registrations during a time period will not call stores', async () => {
    jest.useFakeTimers('modern');
    const clientMetricsStore: any = new EventEmitter();
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore: any = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore: any = {
        bulkUpsert: bulkSpy,
    };
    new ClientMetricsService(
        {
            clientMetricsStore,
            strategyStore: null,
            featureToggleStore: null,
            clientApplicationsStore,
            clientInstanceStore,
            eventStore: null,
        },
        { getLogger },
    );
    jest.advanceTimersByTime(secondsToMilliseconds(6));
    expect(appStoreSpy).toHaveBeenCalledTimes(0);
    expect(bulkSpy).toHaveBeenCalledTimes(0);
    jest.useRealTimers();
});
