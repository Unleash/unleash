import dbInit from '../../helpers/database-init';
import { setupApp } from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';

let app;
let db;

beforeAll(async () => {
    db = await dbInit('metrics_serial', getLogger);
    app = await setupApp(db.stores);
});

beforeEach(async () => {
    await app.services.clientMetricsService.createApplication({
        appName: 'demo-app-1',
        strategies: ['default'],
        announced: true,
    });
    await app.services.clientMetricsService.createApplication({
        appName: 'demo-app-2',
        strategies: ['default', 'extra'],
        description: 'hello',
        announced: true,
    });
    await app.services.clientMetricsService.createApplication({
        appName: 'deletable-app',
        strategies: ['default'],
        description: 'Some desc',
        announced: true,
    });
    await db.stores.clientInstanceStore.insert({
        appName: 'demo-app-1',
        instanceId: 'test-1',
        strategies: ['default'],
        started: 1516026938494,
        interval: 10,
    });
    await db.stores.clientInstanceStore.insert({
        appName: 'demo-seed-2',
        instanceId: 'test-2',
        strategies: ['default'],
        started: 1516026938494,
        interval: 10,
    });
    await db.stores.clientInstanceStore.insert({
        appName: 'deletable-app',
        instanceId: 'inst-1',
        strategies: ['default'],
        started: 1516026938494,
        interval: 10,
    });
    await app.services.clientMetricsService.addPayload({
        appName: 'demo-app-1',
        instanceId: '123',
        bucket: {
            start: Date.now(),
            stop: Date.now(),
            toggles: {
                someToggle: {
                    yes: 100,
                    no: 0,
                },
                anotherToggle: {
                    yes: 0,
                    no: 1,
                },
            },
        },
    });
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

afterEach(async () => {
    await db.reset();
});

test('should get application details', async () => {
    expect.assertions(2);
    return app.request
        .get('/api/admin/metrics/applications/demo-app-1')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.appName).toBe('demo-app-1');
            expect(res.body.instances).toHaveLength(1);
        });
});

test('should get list of applications', async () => {
    expect.assertions(1);
    return app.request
        .get('/api/admin/metrics/applications')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.applications).toHaveLength(3);
        });
});

test('should get list of seen seen-apps', async () => {
    return app.request
        .get('/api/admin/metrics/seen-apps')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.someToggle).toBeDefined();
        });
});

test('should get list of seen seen-toggles', async () => {
    return app.request
        .get('/api/admin/metrics/seen-toggles')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body).toHaveLength(1);
            expect(res.body[0].seenToggles).toContain('someToggle');
        });
});

test('should get list of feature-toggle metrics', async () => {
    return app.request
        .get('/api/admin/metrics/feature-toggles')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.lastHour).toBeDefined();
            expect(res.body.lastHour.anotherToggle).toBeDefined();
            expect(res.body.lastMinute).toBeDefined();
            expect(res.body.lastMinute.anotherToggle).toBeDefined();
        });
});

test('should get feature-toggle metrics', async () => {
    return app.request
        .get('/api/admin/metrics/feature-toggles/anotherToggle')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.lastHour).toBeDefined();
            expect(res.body.lastMinute).toBeDefined();
        });
});

test('should delete application', async () => {
    expect.assertions(2);
    await app.request
        .delete('/api/admin/metrics/applications/deletable-app')
        .expect((res) => {
            expect(res.status).toBe(200);
        });
    return app.request
        .get('/api/admin/metrics/applications')
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.applications).toHaveLength(2);
        });
});

test('deleting an application should be idempotent, so expect 200', async () => {
    expect.assertions(1);
    return app.request
        .delete('/api/admin/metrics/applications/unknown')
        .expect((res) => {
            expect(res.status).toBe(200);
        });
});
