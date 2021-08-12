import EventEmitter from 'events';

import { ClientMetricsStore } from './client-metrics-store';
import getLogger from '../../test/fixtures/no-logger';

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

test('should call database on startup', (done) => {
    jest.useFakeTimers('modern');
    const mock = getMockDb();
    const ee = new EventEmitter();
    const store = new ClientMetricsStore(mock as any, ee, getLogger);

    jest.runAllTicks();

    expect.assertions(2);

    store.on('metrics', (metrics) => {
        expect(store.highestIdSeen).toBe(1);
        expect(metrics.appName).toBe('test');
        store.destroy();

        done();
    });
});

test('should start poller even if initial database fetch fails', (done) => {
    jest.useFakeTimers('modern');
    getLogger.setMuteError(true);
    const mock = getMockDb();
    mock.getMetricsLastHour = () => Promise.reject(new Error('oops'));
    const ee = new EventEmitter();
    const store = new ClientMetricsStore(mock as any, ee, getLogger, 100);
    jest.runAllTicks();

    const metrics = [];
    store.on('metrics', (m) => metrics.push(m));

    store.on('ready', () => {
        jest.useFakeTimers('modern');
        expect(metrics).toHaveLength(0);
        jest.advanceTimersByTime(300);
        jest.useRealTimers();
        process.nextTick(() => {
            expect(metrics).toHaveLength(3);
            expect(store.highestIdSeen).toBe(4);
            store.destroy();
            done();
        });
    });
    getLogger.setMuteError(false);
});

test('should poll for updates', (done) => {
    jest.useFakeTimers('modern');
    const mock = getMockDb();
    const ee = new EventEmitter();
    const store = new ClientMetricsStore(mock as any, ee, getLogger, 100);
    jest.runAllTicks();

    const metrics = [];
    store.on('metrics', (m) => metrics.push(m));

    expect(metrics).toHaveLength(0);

    store.on('ready', () => {
        jest.useFakeTimers('modern');
        expect(metrics).toHaveLength(1);
        jest.advanceTimersByTime(300);
        jest.useRealTimers();
        process.nextTick(() => {
            expect(metrics).toHaveLength(4);
            expect(store.highestIdSeen).toBe(4);
            store.destroy();
            done();
        });
    });
});
