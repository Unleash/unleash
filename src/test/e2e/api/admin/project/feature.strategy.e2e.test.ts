import dbInit from '../../../helpers/database-init';
import { setupApp } from '../../../helpers/test-helper';
import getLogger from '../../../../fixtures/no-logger';

let app;
let db;

beforeAll(async () => {
    db = await dbInit('feature_api_serial', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('Trying to add a strategy configuration to environment not connected to toggle should fail', async () => {
    await app.request
        .post('/api/admin/features')
        .send({
            name: 'com.test.feature',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.name).toBe('com.test.feature');
            expect(res.body.enabled).toBe(false);
            expect(res.body.createdAt).toBeTruthy();
        });
    return app.request
        .post(
            '/api/admin/projects/default/features/com.test.feature/environments/dev/strategies',
        )
        .send({
            name: 'default',
            parameters: {
                userId: '14',
            },
        })
        .expect(400)
        .expect(r => {
            expect(r.body.details[0].message).toBe(
                'You have not added the current environment to the project',
            );
        });
});

test('Can get project overview', async () => {
    await app.request
        .post('/api/admin/features')
        .send({
            name: 'com.test.feature',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.name).toBe('com.test.feature');
            expect(res.body.enabled).toBe(false);
            expect(res.body.createdAt).toBeTruthy();
        });
    await app.request
        .get('/api/admin/projects/default/features')
        .expect(200)
        .expect(r => {
            expect(r.body.name).toBe('Default');
            expect(r.body.features).toBeGreaterThan(0);
            expect(r.body.members).toBe(0);
        });
});

test('Project overview includes environment connected to feature', async () => {
    await app.request
        .post('/api/admin/features')
        .send({
            name: 'com.test.environment',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.name).toBe('com.test.environment');
            expect(res.body.enabled).toBe(false);
            expect(res.body.createdAt).toBeTruthy();
        });
    await app.request
        .post('/api/admin/environments')
        .send({ name: 'project-overview', displayName: 'Project Overview' })
        .set('Content-Type', 'application/json')
        .expect(201);
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({ environment: 'project-overview' })
        .expect(200);
    return app.request
        .get('/api/admin/projects/default/features')
        .expect(200)
        .expect(r => {
            expect(r.body.features[0].environments[0].name).toBe(
                'project-overview',
            );
        });
});

test('Disconnecting environment from project, removes environment from features in project overview', async () => {
    await app.request
        .post('/api/admin/features')
        .send({
            name: 'com.test.environment',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.name).toBe('com.test.environment');
            expect(res.body.enabled).toBe(false);
            expect(res.body.createdAt).toBeTruthy();
        });
    await app.request
        .post('/api/admin/environments')
        .send({ name: 'project-overview', displayName: 'Project Overview' })
        .set('Content-Type', 'application/json')
        .expect(201);
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({ environment: 'project-overview' })
        .expect(200);
    await app.request
        .delete('/api/admin/projects/default/environments/project-overview')
        .expect(200);
    return app.request
        .get('/api/admin/projects/default/features')
        .expect(200)
        .expect(r => {
            expect(r.body.features[0].environments).toHaveLength(0);
        });
});
