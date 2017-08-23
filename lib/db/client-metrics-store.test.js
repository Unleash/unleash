'use strict';

const { test } = require('ava');
const ClientMetricStore = require('./client-metrics-store');
const lolex = require('lolex');

function getMockDb() {
    const list = [
        { id: 4, metrics: { appName: 'test' } },
        { id: 3, metrics: { appName: 'test' } },
        { id: 2, metrics: { appName: 'test' } },
    ];
    return {
        getMetricsLastHour() {
            return Promise.resolve([{ id: 1, metrics: { appName: 'test' } }]);
        },

        getNewMetrics() {
            return Promise.resolve([list.pop() || { id: 0 }]);
        },
    };
}

test.cb('should call database on startup', t => {
    const mock = getMockDb();

    const store = new ClientMetricStore(mock);

    t.plan(2);

    store.on('metrics', metrics => {
        t.true(store.highestIdSeen === 1);
        t.true(metrics.appName === 'test');
        store.destroy();

        t.end();
    });
});

test.cb('should poll for updates', t => {
    const clock = lolex.install();

    const mock = getMockDb();
    const store = new ClientMetricStore(mock, 100);

    const metrics = [];
    store.on('metrics', m => metrics.push(m));

    t.true(metrics.length === 0);

    store.on('ready', () => {
        t.true(metrics.length === 1);
        clock.tick(300);
        process.nextTick(() => {
            t.true(metrics.length === 4);
            t.true(store.highestIdSeen === 4);
            store.destroy();
            clock.uninstall();
            t.end();
        });
    });
});
