'use strict';

const { test } = require('ava');
const UnleashClientMetrics = require('./index');
const sinon = require('sinon');

const { EventEmitter } = require('events');

const appName = 'appName';
const instanceId = 'instanceId';

test('should work without state', (t) => {
    const store = new EventEmitter();
    const metrics = new UnleashClientMetrics(store);

    t.truthy(metrics.getAppsWitToggles());
    t.truthy(metrics.getTogglesMetrics());

    metrics.destroy();
});

test.cb('data should expire', (t) => {
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

    sinon.restore();
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

    t.deepEqual(metrics.getTogglesMetrics().lastHour.toggleX, { yes: 123, no: 0 });
    t.deepEqual(metrics.getTogglesMetrics().lastMinute.toggleX, { yes: 123, no: 0 });


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
    t.deepEqual(metrics.getTogglesMetrics().lastHour.toggleX, { yes: 133, no: 10 });
    t.deepEqual(metrics.getTogglesMetrics().lastMinute.toggleX, { yes: 133, no: 10 });

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

    const appToggles = metrics.getAppsWitToggles();
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
    for (let i=0; i<100; i++) {
        toggleCounts[`toggle${i}`]  = {yes: i, no: i}
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