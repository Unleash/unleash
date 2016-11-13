'use strict';

const { test } = require('ava');
const MetricsService = require('./service');
const sinon = require('sinon');

function getMockDb () {
    const list = [{ id: 2 }, { id: 3 }, { id: 4 }];
    const db = {
        getMetricsLastHour () {
            return Promise.resolve([{ id: 1 }]);
        },

        getNewMetrics () {
            return Promise.resolve([list.pop() || { id: 0 }]);
        },
    };

    return {
        db,
    };
}

test.cb('should call database on startup', (t) => {
    const mock = getMockDb();
    const service = new MetricsService(mock.db);
    t.plan(2);

    service.on('metrics', ([metric]) => {
        t.true(service.highestIdSeen === 1);
        t.true(metric.id === 1);
        t.end();
        service.destroy();
    });
});

test.cb('should poll for updates', (t) => {
    const clock = sinon.useFakeTimers();

    const mock = getMockDb();
    const service = new MetricsService(mock.db, 100);

    const metrics = [];
    service.on('metrics', (_metrics) => {
        _metrics.forEach(m => m && metrics.push(m));
    });

    t.true(metrics.length === 0);

    service.on('ready', () => {
        t.true(metrics.length === 1);

        clock.tick(300);
        clock.restore();

        process.nextTick(() => {
            t.true(metrics.length === 4);
            t.true(metrics[0].id === 1);
            t.true(metrics[1].id === 4);
            t.true(metrics[2].id === 3);
            t.true(metrics[3].id === 2);
            service.destroy();
            t.end();
        });
    });
});
