'use strict';

const { EventEmitter } = require('events');
const lolex = require('lolex');
const ClientMetricStore = require('./client-metrics-store');
const getLogger = require('../../test/fixtures/no-logger');

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
        destroy() {
            // noop
        },
    };
}

test('should call database on startup', done => {
    const mock = getMockDb();
    const ee = new EventEmitter();
    const store = new ClientMetricStore(mock, ee, getLogger);

    expect.assertions(2);

    store.on('metrics', metrics => {
        expect(store.highestIdSeen === 1).toBe(true);
        expect(metrics.appName === 'test').toBe(true);
        store.destroy();

        done();
    });
});

test('should start poller even if inital database fetch fails', done => {
    getLogger.setMuteError(true);
    const clock = lolex.install();
    const mock = getMockDb();
    mock.getMetricsLastHour = () => Promise.reject(new Error('oops'));
    const ee = new EventEmitter();
    const store = new ClientMetricStore(mock, ee, getLogger, 100);

    const metrics = [];
    store.on('metrics', m => metrics.push(m));

    store.on('ready', () => {
        expect(metrics.length === 0).toBe(true);
        clock.tick(300);
        process.nextTick(() => {
            expect(metrics.length === 3).toBe(true);
            expect(store.highestIdSeen === 4).toBe(true);
            store.destroy();
            done();
        });
    });
    getLogger.setMuteError(false);
});

test('should poll for updates', done => {
    const clock = lolex.install();

    const mock = getMockDb();
    const ee = new EventEmitter();
    const store = new ClientMetricStore(mock, ee, getLogger, 100);

    const metrics = [];
    store.on('metrics', m => metrics.push(m));

    expect(metrics.length === 0).toBe(true);

    store.on('ready', () => {
        expect(metrics.length === 1).toBe(true);
        clock.tick(300);
        process.nextTick(() => {
            expect(metrics.length === 4).toBe(true);
            expect(store.highestIdSeen === 4).toBe(true);
            store.destroy();
            done();
        });
    });
});
