'use strict';

const { setupApp } = require('../../helpers/test-helper');
const metricsExample = require('../../../examples/client-metrics.json');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let app;
let db;

beforeAll(async () => {
    db = await dbInit('metrics_api_client', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should be possble to send metrics', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/client/metrics')
        .send(metricsExample)
        .expect(202);
});

test('should require valid send metrics', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/client/metrics')
        .send({
            appName: 'test',
        })
        .expect(400);
});

test('should accept client metrics', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/client/metrics')
        .send({
            appName: 'demo',
            instanceId: '1',
            bucket: {
                start: Date.now(),
                stop: Date.now(),
                toggles: {},
            },
        })
        .expect(202);
});
