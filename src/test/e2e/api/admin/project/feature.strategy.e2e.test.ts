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
        .expect((res) => {
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
        .expect((r) => {
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
        .expect((res) => {
            expect(res.body.name).toBe('project-overview');
            expect(res.body.createdAt).toBeTruthy();
        });
    await app.request
        .get('/api/admin/projects/default')
        .expect(200)
        .expect((r) => {
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
        .expect((res) => {
            expect(res.body.name).toBe('features-for-project');
            expect(res.body.createdAt).toBeTruthy();
        });
    await app.request
        .get('/api/admin/projects/default/features')
        .expect(200)
        .expect((res) => {
            expect(res.body.version).toBeTruthy();
            expect(
                res.body.features.some(
                    (feature) => feature.name === 'features-for-project',
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
        .expect((res) => {
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
        .expect((r) => {
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
        .expect((res) => {
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
        .expect((r) => {
            expect(
                r.body.features.some(
                    (e) => e.environment === 'dis-project-overview',
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
        .post('/api/admin/projects/default/features')
        .send({
            name: 'com.test.enable.environment',
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.name).toBe('com.test.enable.environment');
            expect(res.body.createdAt).toBeTruthy();
        });
    await app.request
        .post(
            '/api/admin/projects/default/features/com.test.enable.environment/environments/enable-feature-environment/on',
        )
        .send({})
        .expect(200);
    await app.request
        .get('/api/admin/projects/default/features/com.test.enable.environment')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            const enabledFeatureEnv = res.body.environments.find(
                (e) => e.name === 'enable-feature-environment',
            );
            expect(enabledFeatureEnv).toBeTruthy();
            expect(enabledFeatureEnv.enabled).toBe(true);
        });
    await app.request
        .post(
            '/api/admin/projects/default/features/com.test.enable.environment/environments/enable-feature-environment/off',
        )
        .send({})
        .expect(200);
    await app.request
        .get('/api/admin/projects/default/features/com.test.enable.environment')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            const disabledFeatureEnv = res.body.environments.find(
                (e) => e.name === 'enable-feature-environment',
            );
            expect(disabledFeatureEnv).toBeTruthy();
            expect(disabledFeatureEnv.enabled).toBe(false);
        });
});

test("Trying to get a project that doesn't exist yields 404", async () => {
    await app.request.get('/api/admin/projects/nonexisting').expect(404);
});

test('Trying to get features for non-existing project also yields 404', async () => {
    await app.request
        .get('/api/admin/projects/nonexisting/features')
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(0);
        });
});

test('Can use new project feature toggle endpoint to create feature toggle without strategies', async () => {
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'new.toggle.without.strategy',
        })
        .expect(201)
        .expect((res) => {
            expect(res.body.project).toBe('default');
        });
});

test('Still validates feature toggle input when creating', async () => {
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'Some invalid name',
        })
        .expect(400);
});

test('Trying to create toggle that already exists yield 409 error', async () => {
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'already.exists.test',
        })
        .expect(201)
        .expect((res) => {
            expect(res.body.project).toBe('default');
        });
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'already.exists.test',
        })
        .expect(409);
});

test('Trying to create toggle under project that does not exist should fail', async () => {
    await app.request
        .post('/api/admin/projects/non-existing-secondary/features')
        .send({
            name: 'project.does.not.exist',
        })
        .expect(404);
});

test('Can get environment info for feature toggle', async () => {
    const envName = 'environment-info';
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

    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: 'environment.info' })
        .expect(201);
    await app.request
        .get(
            `/api/admin/projects/default/features/environment.info/environments/${envName}`,
        )
        .expect(200)
        .expect((res) => {
            expect(res.body.enabled).toBe(false);
            expect(res.body.environment).toBe(envName);
            expect(res.body.strategies).toHaveLength(0);
        });
});

test('Getting environment info for environment that does not exist yields 404', async () => {
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: 'non.existing.env' })
        .expect(201);
    await app.request
        .get(
            '/api/admin/projects/default/features/non.existing.env/environments/non.existing.environment',
        )
        .expect(404);
});

test('Trying to toggle environment that does not exist yields 404', async () => {
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: 'toggle.env' })
        .expect(201);
    await app.request
        .post(
            '/api/admin/projects/default/features/toggle.env/environments/does-not-exist/on',
        )
        .send({})
        .expect(404);
    await app.request
        .post(
            '/api/admin/projects/default/features/toggle.env/environments/does-not-exist/off',
        )
        .send({})
        .expect(404);
});

test('Getting feature that does not exist should yield 404', async () => {
    await app.request
        .get('/api/admin/projects/default/features/non.existing.feature')
        .expect(404);
});

test('Can add strategy to feature toggle', async () => {
    const envName = 'add-strategy';
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
    const featureName = 'feature.strategy.toggle';
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies`,
        )
        .send({
            name: 'default',
            parameters: {
                userId: 'string',
            },
        })
        .expect(200);
    await app.request
        .get(`/api/admin/projects/default/features/${featureName}`)
        .expect((res) => {
            expect(res.body.environments[0].strategies).toHaveLength(1);
        });
});

test('Can get strategies for feature and environment', async () => {
    const envName = 'get-strategy';
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
    const featureName = 'feature.get.strategies';
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies`,
        )
        .send({
            name: 'default',
            parameters: {
                userId: 'string',
            },
        })
        .expect(200);
    await app.request
        .get(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies`,
        )
        .expect(200)
        .expect((res) => {
            expect(res.body).toHaveLength(1);
            expect(res.body[0].parameters.userId).toBe('string');
        });
});

test('Getting strategies for environment that does not exist yields 404', async () => {
    const featureName = 'feature.get.strategies.for.nonexisting';
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);
    await app.request
        .get(
            `/api/admin/projects/default/features/${featureName}/environments/should.not.exist/strategies`,
        )
        .expect(404);
});

test('Can update a strategy based on id', async () => {
    const envName = 'feature.update.strategies';
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
    const featureName = 'feature.update.strategies';
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);
    let strategy;
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies`,
        )
        .send({
            name: 'default',
            parameters: {
                userId: 'string',
            },
        })
        .expect(200)
        .expect((res) => {
            strategy = res.body;
        });

    await app.request
        .put(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies/${strategy.id}`,
        )
        .send({ parameters: { userId: 'string', companyId: 'string' } })
        .expect(200);
    await app.request
        .get(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies/${strategy.id}`,
        )
        .expect(200)
        .expect((res) => {
            expect(res.body.parameters.companyId).toBeTruthy();
            expect(res.body.parameters.userId).toBeTruthy();
        });
});

test('Trying to update a non existing feature strategy should yield 404', async () => {
    const envName = 'feature.non.existing.strategy';
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
    const featureName = 'feature.non.existing.strategy';
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);
    await app.request
        .put(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies/some-non-existing-id`,
        )
        .send({ parameters: { fancyField: 'string' } })
        .expect(404);
});

test('Trying to get a non existing feature strategy should yield 404', async () => {
    const envName = 'feature.non.existing.strategy.get';
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
    const featureName = 'feature.non.existing.strategy.get';
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);
    await app.request
        .get(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies/some-non-existing-id`,
        )
        .expect(404);
});
