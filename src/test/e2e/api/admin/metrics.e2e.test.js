'use strict';;
const dbInit = require('../../helpers/database-init');
const { setupApp } = require('../../helpers/test-helper');
const getLogger = require('../../../fixtures/no-logger');

let stores;
let db;
let reset = () => {};

beforeAll(async () => {
    db = await dbInit('metrics_serial', getLogger);
    stores = db.stores;
    reset = db.reset;
});

test(async () => {
    await db.destroy();
});

afterEach(async () => {
    await reset();
});

test('should get application details', async () => {
    expect.assertions(3);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/metrics/applications/demo-app-1')
        .expect('Content-Type', /json/)
        .expect(res => {
            expect(res.status === 200).toBe(true);
            expect(res.body.appName === 'demo-app-1').toBe(true);
            expect(res.body.instances.length === 1).toBe(true);
        });
});

test('should get list of applications', async () => {
    expect.assertions(2);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/metrics/applications')
        .expect('Content-Type', /json/)
        .expect(res => {
            expect(res.status === 200).toBe(true);
            expect(res.body.applications.length).toBe(3);
        });
});

test('should delete application', async () => {
    expect.assertions(2);
    const request = await setupApp(stores);
    await request
        .delete('/api/admin/metrics/applications/deletable-app')
        .expect(res => {
            expect(res.status).toBe(200);
        });
    return request
        .get('/api/admin/metrics/applications')
        .expect('Content-Type', /json/)
        .expect(res => {
            expect(res.body.applications.length).toBe(2);
        });
});

test(
    'deleting an application should be idempotent, so expect 200',
    async () => {
        expect.assertions(1);
        const request = await setupApp(stores);
        return request
            .delete('/api/admin/metrics/applications/unknown')
            .expect(res => {
                expect(res.status).toBe(200);
            });
    }
);
