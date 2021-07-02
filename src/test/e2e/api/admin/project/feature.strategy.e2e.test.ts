import dbInit from '../../../helpers/database-init';
import { setupApp } from '../../../helpers/test-helper';
import getLogger from '../../../../fixtures/no-logger';

let app;
let db;

beforeAll(async () => {
    db = await dbInit('feature_strategy_api_serial', getLogger);
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
            name: 'project-overview',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.name).toBe('project-overview');
            expect(res.body.createdAt).toBeTruthy();
        });
    await app.request
        .get('/api/admin/projects/default')
        .expect(200)
        .expect(r => {
            expect(r.body.name).toBe('Default');
            expect(r.body.features).toHaveLength(2);
            expect(r.body.members).toBe(0);
        });
});

test('Can get features for project', async () => {
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'features-for-project',
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.name).toBe('features-for-project');
            expect(res.body.createdAt).toBeTruthy();
        });
    await app.request
        .get('/api/admin/projects/default/features')
        .expect(200)
        .expect(res => {
            expect(res.body.version).toBeTruthy();
            expect(
                res.body.features.some(
                    feature => feature.name === 'features-for-project',
                ),
            ).toBeTruthy();
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
        .get('/api/admin/projects/default')
        .expect(200)
        .expect(r => {
            expect(r.body.features[0].environments[0].name).toBe(':global:');
            expect(r.body.features[0].environments[1].name).toBe(
                'project-overview',
            );
        });
});

test('Disconnecting environment from project, removes environment from features in project overview', async () => {
    await app.request
        .post('/api/admin/features')
        .send({
            name: 'com.test.disconnect.environment',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.name).toBe('com.test.disconnect.environment');
            expect(res.body.createdAt).toBeTruthy();
        });
    await app.request
        .post('/api/admin/environments')
        .send({ name: 'dis-project-overview', displayName: 'Project Overview' })
        .set('Content-Type', 'application/json')
        .expect(201);
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({ environment: 'dis-project-overview' })
        .expect(200);
    await app.request
        .delete('/api/admin/projects/default/environments/dis-project-overview')
        .expect(200);
    return app.request
        .get('/api/admin/projects/default')
        .expect(200)
        .expect(r => {
            expect(
                r.body.features.some(
                    e => e.environment === 'dis-project-overview',
                ),
            ).toBeFalsy();
        });
});

test('Can enable/disable environment for feature', async () => {
    const envName = 'enable-feature-environment';
    // Create environment
    await app.request
        .post('/api/admin/environments')
        .send({
            name: envName,
            displayName: 'Enable feature for environment',
        })
        .set('Content-Type', 'application/json')
        .expect(201);
    // Connect environment to project
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envName,
        })
        .expect(200);

    // Create feature
    await app.request
        .post('/api/admin/features')
        .send({
            name: 'com.test.enable.environment',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.name).toBe('com.test.enable.environment');
            expect(res.body.createdAt).toBeTruthy();
        });
    await app.request
        .post(
            `/api/admin/projects/default/features/com.test.enable.environment/environments/enable-feature-environment/on`,
        )
        .send({})
        .expect(200);
    await app.request
        .get('/api/admin/projects/default/features/com.test.enable.environment')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            const enabledFeatureEnv = res.body.environments.find(
                e => e.name === 'enable-feature-environment',
            );
            expect(enabledFeatureEnv).toBeTruthy();
            expect(enabledFeatureEnv.enabled).toBe(true);
        });
    await app.request
        .post(
            `/api/admin/projects/default/features/com.test.enable.environment/environments/enable-feature-environment/off`,
        )
        .send({})
        .expect(200);
    await app.request
        .get('/api/admin/projects/default/features/com.test.enable.environment')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            const disabledFeatureEnv = res.body.environments.find(
                e => e.name === 'enable-feature-environment',
            );
            expect(disabledFeatureEnv).toBeTruthy();
            expect(disabledFeatureEnv.enabled).toBe(false);
        });
});
