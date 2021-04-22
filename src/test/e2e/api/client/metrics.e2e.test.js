'use strict';;
const { setupApp } = require('../../helpers/test-helper');
const metricsExample = require('../../../examples/client-metrics.json');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('metrics_api_client', getLogger);
    stores = db.stores;
});

test(async () => {
    await db.destroy();
});

test('should be possble to send metrics', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .post('/api/client/metrics')
        .send(metricsExample)
        .expect(202);
});

test('should require valid send metrics', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
        .post('/api/client/metrics')
        .send({
            appName: 'test',
        })
        .expect(400);
});

test('should accept client metrics', async () => {
    expect.assertions(0);
    const request = await setupApp(stores);
    return request
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
