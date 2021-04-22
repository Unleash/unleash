'use strict';

const moment = require('moment');

const { EventEmitter } = require('events');
const UnleashClientMetrics = require('./index');

const appName = 'appName';
const instanceId = 'instanceId';

const getLogger = require('../../../test/fixtures/no-logger');

test('should work without state', () => {
    const clientMetricsStore = new EventEmitter();
    const metrics = new UnleashClientMetrics(
        { clientMetricsStore },
        { getLogger },
    );

    expect(metrics.getAppsWithToggles()).toBeTruthy();
    expect(metrics.getTogglesMetrics()).toBeTruthy();

    metrics.destroy();
});

test('data should expire', () => {
    jest.useFakeTimers();

    const clientMetricsStore = new EventEmitter();
    const metrics = new UnleashClientMetrics(
        { clientMetricsStore },
        { getLogger },
    );

    metrics.addPayload({
        appName,
        instanceId,
        bucket: {
            start: Date.now() - 2000,
            stop: Date.now() - 1000,
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

    jest.advanceTimersByTime(60 * 1000);
    expect(lastMinExpires).toBe(1);
    expect(lastHourExpires).toBe(0);

    jest.advanceTimersByTime(60 * 60 * 1000);
    expect(lastMinExpires).toBe(1);
    expect(lastHourExpires).toBe(1);

    jest.useRealTimers();
});

test('should listen to metrics from store', () => {
    const clientMetricsStore = new EventEmitter();
    const metrics = new UnleashClientMetrics(
        { clientMetricsStore },
        { getLogger },
    );
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

    expect(metrics.apps[appName].count === 123).toBeTruthy();
    expect(metrics.globalCount === 123).toBeTruthy();

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

    expect(metrics.globalCount === 143).toBeTruthy();
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
    const metrics = new UnleashClientMetrics(
        { clientMetricsStore },
        { getLogger },
    );
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

    expect(appToggles.length === 1).toBeTruthy();
    expect(appToggles[0].seenToggles.length === 2).toBeTruthy();
    expect(appToggles[0].seenToggles.includes('toggleX')).toBeTruthy();
    expect(appToggles[0].seenToggles.includes('toggleY')).toBeTruthy();

    expect(togglesForApp.length === 2).toBeTruthy();
    expect(togglesForApp.includes('toggleX')).toBeTruthy();
    expect(togglesForApp.includes('toggleY')).toBeTruthy();
    metrics.destroy();
});

test('should handle a lot of toggles', () => {
    const clientMetricsStore = new EventEmitter();
    const metrics = new UnleashClientMetrics(
        { clientMetricsStore },
        { getLogger },
    );

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

    expect(seenToggles.length === 100).toBeTruthy();
    metrics.destroy();
});

test('should have correct values for lastMinute', () => {
    jest.useFakeTimers();

    const clientMetricsStore = new EventEmitter();
    const metrics = new UnleashClientMetrics(
        { clientMetricsStore },
        { getLogger },
    );

    const now = new Date();
    const input = [
        {
            start: moment(now).subtract(1, 'hour'),
            stop: moment(now).subtract(59, 'minutes'),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
        {
            start: moment(now).subtract(30, 'minutes'),
            stop: moment(now).subtract(29, 'minutes'),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
        {
            start: moment(now).subtract(2, 'minutes'),
            stop: moment(now).subtract(1, 'minutes'),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
        {
            start: moment(now).subtract(2, 'minutes'),
            stop: moment(now).subtract(59, 'seconds'),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
        {
            start: moment(now),
            stop: moment(now).subtract(30, 'seconds'),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
    ];

    input.forEach(bucket => {
        clientMetricsStore.emit('metrics', {
            appName,
            instanceId,
            bucket,
        });
    });

    const seenToggles = metrics.getSeenTogglesByAppName(appName);
    expect(seenToggles.length === 1).toBeTruthy();

    // metrics.se
    let c = metrics.getTogglesMetrics();
    expect(c.lastMinute.toggle).toEqual({ yes: 20, no: 20 });

    jest.advanceTimersByTime(10 * 1000);
    c = metrics.getTogglesMetrics();
    expect(c.lastMinute.toggle).toEqual({ yes: 10, no: 10 });

    jest.advanceTimersByTime(20 * 1000);
    c = metrics.getTogglesMetrics();
    expect(c.lastMinute.toggle).toEqual({ yes: 0, no: 0 });

    metrics.destroy();
    jest.useRealTimers();
});

test('should have correct values for lastHour', () => {
    jest.useFakeTimers();

    const clientMetricsStore = new EventEmitter();
    const metrics = new UnleashClientMetrics(
        { clientMetricsStore },
        { getLogger },
    );

    const now = new Date();
    const input = [
        {
            start: moment(now).subtract(1, 'hour'),
            stop: moment(now).subtract(59, 'minutes'),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
        {
            start: moment(now).subtract(30, 'minutes'),
            stop: moment(now).subtract(29, 'minutes'),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
        {
            start: moment(now).subtract(15, 'minutes'),
            stop: moment(now).subtract(14, 'minutes'),
            toggles: {
                toggle: { yes: 10, no: 10 },
            },
        },
        {
            start: moment(now).add(59, 'minutes'),
            stop: moment(now).add(1, 'hour'),
            toggles: {
                toggle: { yes: 11, no: 11 },
            },
        },
    ];

    input.forEach(bucket => {
        clientMetricsStore.emit('metrics', {
            appName,
            instanceId,
            bucket,
        });
    });

    const seenToggles = metrics.getSeenTogglesByAppName(appName);

    expect(seenToggles.length === 1).toBeTruthy();

    // metrics.se
    let c = metrics.getTogglesMetrics();
    expect(c.lastHour.toggle).toEqual({ yes: 41, no: 41 });

    jest.advanceTimersByTime(10 * 1000);
    c = metrics.getTogglesMetrics();
    expect(c.lastHour.toggle).toEqual({ yes: 41, no: 41 });

    // at 30
    jest.advanceTimersByTime(30 * 60 * 1000);
    c = metrics.getTogglesMetrics();
    expect(c.lastHour.toggle).toEqual({ yes: 31, no: 31 });

    // at 45
    jest.advanceTimersByTime(15 * 60 * 1000);
    c = metrics.getTogglesMetrics();
    expect(c.lastHour.toggle).toEqual({ yes: 21, no: 21 });

    // at 1:15
    jest.advanceTimersByTime(30 * 60 * 1000);
    c = metrics.getTogglesMetrics();
    expect(c.lastHour.toggle).toEqual({ yes: 11, no: 11 });

    // at 2:00
    jest.advanceTimersByTime(45 * 60 * 1000);
    c = metrics.getTogglesMetrics();
    expect(c.lastHour.toggle).toEqual({ yes: 0, no: 0 });

    metrics.destroy();
    jest.useRealTimers();
});

test('should not fail when toggle metrics is missing yes/no field', () => {
    const clientMetricsStore = new EventEmitter();
    const metrics = new UnleashClientMetrics(
        { clientMetricsStore },
        { getLogger },
    );
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
    jest.useFakeTimers(); // sinon has superseded lolex
    const clientMetricsStore = new EventEmitter();
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore = {
        bulkUpsert: bulkSpy,
    };
    const clientMetrics = new UnleashClientMetrics(
        { clientMetricsStore, clientApplicationsStore, clientInstanceStore },
        { getLogger },
    );
    const client1 = {
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
    await jest.advanceTimersByTime(7 * 1000);
    expect(appStoreSpy.callCount).toBe(1);
    expect(bulkSpy.callCount).toBe(1);
    const registrations = appStoreSpy.firstCall.args[0];
    expect(registrations.length).toBe(1);
    expect(registrations[0].appName).toBe(client1.appName);
    expect(registrations[0].instanceId).toBe(client1.instanceId);
    expect(registrations[0].started).toBe(client1.started);
    expect(registrations[0].interval).toBe(client1.interval);
    jest.useRealTimers();
});

test('Multiple unique clients causes multiple registrations', async () => {
    jest.useFakeTimers();
    const clientMetricsStore = new EventEmitter();
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore = {
        bulkUpsert: bulkSpy,
    };
    const clientMetrics = new UnleashClientMetrics(
        { clientMetricsStore, clientApplicationsStore, clientInstanceStore },
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
    await jest.advanceTimersByTime(7 * 1000);
    expect(appStoreSpy.callCount).toBe(1);
    expect(bulkSpy.callCount).toBe(1);
    const registrations = appStoreSpy.firstCall.args[0];
    expect(registrations.length).toBe(2);
    jest.useRealTimers();
});
test('Same client registered outside of dedup interval will be registered twice', async () => {
    jest.useFakeTimers(); // sinon has superseded lolex
    const clientMetricsStore = new EventEmitter();
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore = {
        bulkUpsert: bulkSpy,
    };
    const bulkInterval = 2000;
    const clientMetrics = new UnleashClientMetrics(
        { clientMetricsStore, clientApplicationsStore, clientInstanceStore },
        { getLogger, bulkInterval },
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
    await jest.advanceTimersByTime(3 * 1000);
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await jest.advanceTimersByTime(3 * 1000);
    expect(appStoreSpy.callCount).toBe(2);
    expect(bulkSpy.callCount).toBe(2);
    const firstRegistrations = appStoreSpy.firstCall.args[0];
    const secondRegistrations = appStoreSpy.secondCall.args[0];
    expect(firstRegistrations[0].appName).toBe(secondRegistrations[0].appName);
    expect(firstRegistrations[0].instanceId).toBe(
        secondRegistrations[0].instanceId,
    );
    jest.useRealTimers();
});

test('No registrations during a time period will not call stores', async () => {
    jest.useFakeTimers();
    const clientMetricsStore = new EventEmitter();
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore = {
        bulkUpsert: bulkSpy,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const metrics = new UnleashClientMetrics(
        { clientMetricsStore, clientApplicationsStore, clientInstanceStore },
        { getLogger },
    );
    jest.advanceTimersByTime(6000);
    expect(appStoreSpy).toHaveBeenCalledTimes(0);
    expect(bulkSpy).toHaveBeenCalledTimes(0);
    jest.useRealTimers();
});
