'use strict';

const { test } = require('ava');
const UnleashClientMetrics = require('./index');
const sinon = require('sinon');

const appName = 'appName';
const instanceId = 'instanceId';

test('should work without state', (t) => {
    const metrics = new UnleashClientMetrics();

    t.truthy(metrics.getMetricsOverview());
    t.truthy(metrics.getTogglesMetrics());

    metrics.destroy();
});

test('addPayload', t => {
    const metrics = new UnleashClientMetrics();
    metrics.addPayload({
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

    t.truthy(metrics.clients[instanceId].appName === appName);
    t.truthy(metrics.clients[instanceId].count === 123);
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

    t.truthy(metrics.clients[instanceId].count === 143);
    t.truthy(metrics.globalCount === 143);
    t.deepEqual(metrics.getTogglesMetrics().lastHour.toggleX, { yes: 133, no: 10 });
    t.deepEqual(metrics.getTogglesMetrics().lastMinute.toggleX, { yes: 133, no: 10 });

    metrics.destroy();
});

test('addBucket', t => {
    const metrics = new UnleashClientMetrics();
    metrics.addClient(appName, instanceId);
    metrics.addBucket(appName, instanceId, {
        start: new Date(),
        stop: new Date(),
        toggles: {
            toggleX: {
                yes: 123,
                no: 0,
            },
        },
    });
    t.truthy(metrics.clients[instanceId].count === 123);
    t.truthy(metrics.globalCount === 123);
    t.deepEqual(metrics.getTogglesMetrics().lastMinute.toggleX, { yes: 123, no: 0 });

    metrics.destroy();
});

test('addClient', t => {
    const metrics = new UnleashClientMetrics();

    metrics.addClient(appName, instanceId);
    metrics.addClient(appName, instanceId, new Date());

    t.truthy(metrics.clients[instanceId].count === 0);
    t.truthy(metrics.globalCount === 0);

    metrics.destroy();
});

test('addApp', t => {
    const metrics = new UnleashClientMetrics();

    metrics.addApp(appName, instanceId);
    t.truthy(metrics.apps[appName].clients.length === 1);
    metrics.addApp(appName, 'instanceId2');
    t.truthy(metrics.apps[appName].clients.length === 2);

    metrics.addApp('appName2', 'instanceId2');
    t.truthy(metrics.apps.appName2.clients.length === 1);
    metrics.addApp('appName2', instanceId);
    t.truthy(metrics.apps.appName2.clients.length === 2);

    metrics.destroy();
});
