import configureStore from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';
import fetchMock from 'fetch-mock';
import MetricsPoller from '../metrics-poller';

const mockStore = configureStore([thunkMiddleware]);

describe('metrics-poller.js', () => {
    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    test('Should not start poller before toggles are recieved', () => {
        const initialState = { features: [{ name: 'test1' }] };
        const store = mockStore(initialState);
        fetchMock.getOnce('api/admin/metrics/feature-toggles', {
            body: { lastHour: {}, lastMinute: {} },
            headers: { 'content-type': 'application/json' },
        });

        const metricsPoller = new MetricsPoller(store);
        metricsPoller.start();

        expect(metricsPoller.timer).toBeUndefined();
    });

    test('Should not start poller when state does not contain toggles', () => {
        const initialState = { features: [] };
        const store = mockStore(initialState);

        const metricsPoller = new MetricsPoller(store);
        metricsPoller.start();

        store.dispatch({
            type: 'some',
            receivedAt: Date.now(),
        });

        expect(metricsPoller.timer).toBeUndefined();
    });

    test('Should start poller when state gets toggles', () => {
        fetchMock.getOnce('api/admin/metrics/feature-toggles', {
            body: { lastHour: {}, lastMinute: {} },
            headers: { 'content-type': 'application/json' },
        });

        const initialState = { features: [{ name: 'test1' }] };
        const store = mockStore(initialState);

        const metricsPoller = new MetricsPoller(store);
        metricsPoller.start();

        store.dispatch({
            type: 'RECEIVE_FEATURE_TOGGLES',
            featureToggles: [{ name: 'test' }],
            receivedAt: Date.now(),
        });

        expect(metricsPoller.timer).toBeDefined();
    });
});
