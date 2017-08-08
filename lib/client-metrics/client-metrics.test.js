'use strict';

const { test } = require('ava');
const UnleashClientMetrics = require('./index');
const moment = require('moment');
const sinon = require('sinon');

const { EventEmitter } = require('events');

const appName = 'appName';
const instanceId = 'instanceId';

test('should work without state', t => {
    const store = new EventEmitter();
    const metrics = new UnleashClientMetrics(store);

    t.truthy(metrics.getAppsWithToggles());
    t.truthy(metrics.getTogglesMetrics());

    metrics.destroy();
});

test.cb('data should expire', t => {
    const clock = sinon.useFakeTimers();

    const store = new EventEmitter();
    const metrics = new UnleashClientMetrics(store);

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

    clock.tick(60 * 1000);
    t.true(lastMinExpires === 1);
    t.true(lastHourExpires === 0);

    clock.tick(60 * 60 * 1000);
    t.true(lastMinExpires === 1);
    t.true(lastHourExpires === 1);

    clock.restore();
    t.end();
});

test('should listen to metrics from store', t => {
    const store = new EventEmitter();
    const metrics = new UnleashClientMetrics(store);
    store.emit('metrics', {
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

    t.truthy(metrics.apps[appName].count === 123);
    t.truthy(metrics.globalCount === 123);

    t.deepEqual(metrics.getTogglesMetrics().lastHour.toggleX, {
        yes: 123,
        no: 0,
    });
    t.deepEqual(metrics.getTogglesMetrics().lastMinute.toggleX, {
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

    t.truthy(metrics.globalCount === 143);
    t.deepEqual(metrics.getTogglesMetrics().lastHour.toggleX, {
        yes: 133,
        no: 10,
    });
    t.deepEqual(metrics.getTogglesMetrics().lastMinute.toggleX, {
        yes: 133,
        no: 10,
    });

    metrics.destroy();
});

test('should build up list of seend toggles when new metrics arrives', t => {
    const store = new EventEmitter();
    const metrics = new UnleashClientMetrics(store);
    store.emit('metrics', {
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

    t.truthy(appToggles.length === 1);
    t.truthy(appToggles[0].seenToggles.length === 2);
    t.truthy(appToggles[0].seenToggles.includes('toggleX'));
    t.truthy(appToggles[0].seenToggles.includes('toggleY'));

    t.truthy(togglesForApp.length === 2);
    t.truthy(togglesForApp.includes('toggleX'));
    t.truthy(togglesForApp.includes('toggleY'));
    metrics.destroy();
});

test('should handle a lot of toggles', t => {
    const store = new EventEmitter();
    const metrics = new UnleashClientMetrics(store);

    const toggleCounts = {};
    for (let i = 0; i < 100; i++) {
        toggleCounts[`toggle${i}`] = { yes: i, no: i };
    }

    store.emit('metrics', {
        appName,
        instanceId,
        bucket: {
            start: new Date(),
            stop: new Date(),
            toggles: toggleCounts,
        },
    });

    const seenToggles = metrics.getSeenTogglesByAppName(appName);

    t.truthy(seenToggles.length === 100);
    metrics.destroy();
});

test('should have correct values for lastMinute', t => {
    const clock = sinon.useFakeTimers();

    const store = new EventEmitter();
    const metrics = new UnleashClientMetrics(store);

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
        store.emit('metrics', {
            appName,
            instanceId,
            bucket,
        });
    });

    const seenToggles = metrics.getSeenTogglesByAppName(appName);
    t.truthy(seenToggles.length === 1);

    // metrics.se
    let c = metrics.getTogglesMetrics();
    t.deepEqual(c.lastMinute.toggle, { yes: 20, no: 20 });

    clock.tick(10 * 1000);
    c = metrics.getTogglesMetrics();
    t.deepEqual(c.lastMinute.toggle, { yes: 10, no: 10 });

    clock.tick(20 * 1000);
    c = metrics.getTogglesMetrics();
    t.deepEqual(c.lastMinute.toggle, { yes: 0, no: 0 });

    metrics.destroy();
    clock.restore();
});

test('should have correct values for lastHour', t => {
    const clock = sinon.useFakeTimers();

    const store = new EventEmitter();
    const metrics = new UnleashClientMetrics(store);

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
        store.emit('metrics', {
            appName,
            instanceId,
            bucket,
        });
    });

    const seenToggles = metrics.getSeenTogglesByAppName(appName);

    t.truthy(seenToggles.length === 1);

    // metrics.se
    let c = metrics.getTogglesMetrics();
    t.deepEqual(c.lastHour.toggle, { yes: 41, no: 41 });

    clock.tick(10 * 1000);
    c = metrics.getTogglesMetrics();
    t.deepEqual(c.lastHour.toggle, { yes: 41, no: 41 });

    // at 30
    clock.tick(30 * 60 * 1000);
    c = metrics.getTogglesMetrics();
    t.deepEqual(c.lastHour.toggle, { yes: 31, no: 31 });

    // at 45
    clock.tick(15 * 60 * 1000);
    c = metrics.getTogglesMetrics();
    t.deepEqual(c.lastHour.toggle, { yes: 21, no: 21 });

    // at 1:15
    clock.tick(30 * 60 * 1000);
    c = metrics.getTogglesMetrics();
    t.deepEqual(c.lastHour.toggle, { yes: 11, no: 11 });

    // at 2:00
    clock.tick(45 * 60 * 1000);
    c = metrics.getTogglesMetrics();
    t.deepEqual(c.lastHour.toggle, { yes: 0, no: 0 });

    metrics.destroy();
    clock.restore();
});

test('should not fail when toggle metrics is missing yes/no field', t => {
    const store = new EventEmitter();
    const metrics = new UnleashClientMetrics(store);
    store.emit('metrics', {
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

    t.is(metrics.globalCount, 123);
    t.deepEqual(metrics.getTogglesMetrics().lastMinute.toggleX, {
        yes: 123,
        no: 0,
    });

    metrics.destroy();
});
