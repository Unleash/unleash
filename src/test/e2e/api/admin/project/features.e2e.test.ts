import dbInit, { ITestDb } from '../../../helpers/database-init';
import { IUnleashTest, setupApp } from '../../../helpers/test-helper';
import getLogger from '../../../../fixtures/no-logger';
import { DEFAULT_ENV } from '../../../../../lib/util/constants';
import {
    FEATURE_ENVIRONMENT_DISABLED,
    FEATURE_ENVIRONMENT_ENABLED,
    FEATURE_METADATA_UPDATED,
    FEATURE_STRATEGY_REMOVE,
} from '../../../../../lib/types/events';

let app: IUnleashTest;
let db: ITestDb;
const sortOrderFirst = 0;
const sortOrderSecond = 10;
const sortOrderDefault = 9999;

beforeAll(async () => {
    db = await dbInit('feature_strategy_api_serial', getLogger);
    app = await setupApp(db.stores);
});

afterEach(async () => {
    const all = await db.stores.projectStore.getEnvironmentsForProject(
        'default',
    );
    await Promise.all(
        all
            .filter((env) => env !== DEFAULT_ENV)
            .map(async (env) =>
                db.stores.projectStore.deleteEnvironmentForProject(
                    'default',
                    env,
                ),
            ),
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

async function addStrategies(featureName: string, envName: string) {
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
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies`,
        )
        .send({
            name: 'default',
            parameters: {
                userId: 'string',
            },
            sortOrder: sortOrderFirst,
        })
        .expect(200);
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies`,
        )
        .send({
            name: 'default',
            parameters: {
                userId: 'string',
            },
            sortOrder: sortOrderSecond,
        })
        .expect(200);
}

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
    await db.stores.environmentStore.create({
        name: 'project-overview',
        type: 'production',
    });
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({ environment: 'project-overview' })
        .expect(200);
    return app.request
        .get('/api/admin/projects/default')
        .expect(200)
        .expect((r) => {
            expect(r.body.features[0].environments[0].name).toBe(DEFAULT_ENV);
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
    await db.stores.environmentStore.create({
        name: 'dis-project-overview',
        type: 'production',
    });
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

test('Can enable/disable environment for feature with strategies', async () => {
    const envName = 'enable-feature-environment';
    const featureName = 'com.test.enable.environment';
    // Create environment
    await db.stores.environmentStore.create({
        name: envName,
        type: 'production',
    });
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
            name: featureName,
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.name).toBe(featureName);
            expect(res.body.createdAt).toBeTruthy();
        });

    // Add strategy to it
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
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/on`,
        )
        .set('Content-Type', 'application/json')
        .expect(200);
    await app.request
        .get(`/api/admin/projects/default/features/${featureName}`)
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
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/off`,
        )
        .send({})
        .expect(200);
    await app.request
        .get(`/api/admin/projects/default/features/${featureName}`)
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

test('Can create feature toggle without strategies', async () => {
    const name = 'new.toggle.without.strategy.2';
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name });
    const { body: toggle } = await app.request.get(
        `/api/admin/projects/default/features/${name}`,
    );
    expect(toggle.environments).toHaveLength(1);
    expect(toggle.environments[0].strategies).toHaveLength(0);
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
    await db.stores.environmentStore.create({
        name: envName,
        type: 'production',
    });
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

test('Should update feature toggle', async () => {
    const url = '/api/admin/projects/default/features';
    const name = 'new.toggle.update';
    await app.request
        .post(url)
        .send({ name, description: 'some', type: 'release' })
        .expect(201);
    await app.request
        .put(`${url}/${name}`)
        .send({ name, description: 'updated', type: 'kill-switch' })
        .expect(200);

    const { body: toggle } = await app.request.get(`${url}/${name}`);

    expect(toggle.name).toBe(name);
    expect(toggle.description).toBe('updated');
    expect(toggle.type).toBe('kill-switch');
    expect(toggle.archived).toBeFalsy();
});

test('Should not change name of feature toggle', async () => {
    const url = '/api/admin/projects/default/features';
    const name = 'new.toggle.update.2';
    await app.request
        .post(url)
        .send({ name, description: 'some', type: 'release' })
        .expect(201);
    await app.request
        .put(`${url}/${name}`)
        .send({ name: 'new name', description: 'updated', type: 'kill-switch' })
        .expect(400);
});

test('Should not change project of feature toggle even if it is part of body', async () => {
    const url = '/api/admin/projects/default/features';
    const name = 'new.toggle.update.3';
    await app.request
        .post(url)
        .send({ name, description: 'some', type: 'release' })
        .expect(201);
    const { body } = await app.request
        .put(`${url}/${name}`)
        .send({
            name,
            description: 'updated',
            type: 'kill-switch',
            project: 'new',
        })
        .expect(200);

    expect(body.project).toBe('default');
});

test('Should patch feature toggle', async () => {
    const url = '/api/admin/projects/default/features';
    const name = 'new.toggle.patch';
    await app.request
        .post(url)
        .send({ name, description: 'some', type: 'release' })
        .expect(201);
    await app.request
        .patch(`${url}/${name}`)
        .send([
            { op: 'replace', path: '/description', value: 'New desc' },
            { op: 'replace', path: '/type', value: 'kill-switch' },
        ])
        .expect(200);

    const { body: toggle } = await app.request.get(`${url}/${name}`);

    expect(toggle.name).toBe(name);
    expect(toggle.description).toBe('New desc');
    expect(toggle.type).toBe('kill-switch');
    expect(toggle.archived).toBeFalsy();
    const events = await db.stores.eventStore.getAll({
        type: FEATURE_METADATA_UPDATED,
    });
    const updateForOurToggle = events.find((e) => e.data.name === name);
    expect(updateForOurToggle).toBeTruthy();
    expect(updateForOurToggle.data.description).toBe('New desc');
    expect(updateForOurToggle.data.type).toBe('kill-switch');
});

test('Should archive feature toggle', async () => {
    const url = '/api/admin/projects/default/features';
    const name = 'new.toggle.archive';
    await app.request
        .post(url)
        .send({ name, description: 'some', type: 'release' })
        .expect(201);
    await app.request.delete(`${url}/${name}`);

    await app.request.get(`${url}/${name}`).expect(404);
    const { body } = await app.request
        .get(`/api/admin/archive/features`)
        .expect(200);

    const toggle = body.features.find((f) => f.name === name);
    expect(toggle).toBeDefined();
});

test('Can add strategy to feature toggle to a "some-env-2"', async () => {
    const envName = 'some-env-2';
    const featureName = 'feature.strategy.toggle';
    // Create environment
    await db.stores.environmentStore.create({
        name: envName,
        type: 'production',
    });
    // Connect environment to project
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envName,
        })
        .expect(200);

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
            const env = res.body.environments.find((e) => e.name === envName);
            expect(env.strategies).toHaveLength(1);
        });
});

test('Environments are returned in sortOrder', async () => {
    const sortedSecond = 'sortedSecond';
    const sortedLast = 'sortedLast';
    const featureName = 'feature.strategy.toggle.sortOrder';
    // Create environments
    await db.stores.environmentStore.create({
        name: sortedLast,
        type: 'production',
        sortOrder: 8000,
    });
    await db.stores.environmentStore.create({
        name: sortedSecond,
        type: 'production',
        sortOrder: 8,
    });

    // Connect environments to project
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: sortedSecond,
        })
        .expect(200);
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: sortedLast,
        })
        .expect(200);
    /* Create feature toggle */
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);
    /* create strategies connected to feature toggle */
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${sortedSecond}/strategies`,
        )
        .send({
            name: 'default',
            parameters: {
                userId: 'string',
            },
        })
        .expect(200);
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${sortedLast}/strategies`,
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
        .expect(200)
        .expect((res) => {
            expect(res.body.environments).toHaveLength(3);
            expect(res.body.environments[0].name).toBe(DEFAULT_ENV);
            expect(res.body.environments[1].name).toBe(sortedSecond);
            expect(res.body.environments[2].name).toBe(sortedLast);
        });
});

test('Can get strategies for feature and environment', async () => {
    const envName = 'get-strategy';
    // Create environment
    await db.stores.environmentStore.create({
        name: envName,
        type: 'production',
    });
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
    await db.stores.environmentStore.create({
        name: envName,
        type: 'production',
    });
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
    await db.stores.environmentStore.create({
        name: envName,
        type: 'production',
    });
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

test('Can patch a strategy based on id', async () => {
    const BASE_URI = '/api/admin/projects/default';
    const envName = 'feature.patch.strategies';
    const featureName = 'feature.patch.strategies';

    // Create environment
    await db.stores.environmentStore.create({
        name: envName,
        type: 'test',
    });
    // Connect environment to project
    await app.request
        .post(`${BASE_URI}/environments`)
        .send({
            environment: envName,
        })
        .expect(200);
    await app.request
        .post(`${BASE_URI}/features`)
        .send({ name: featureName })
        .expect(201);
    let strategy;
    await app.request
        .post(
            `${BASE_URI}/features/${featureName}/environments/${envName}/strategies`,
        )
        .send({
            name: 'flexibleRollout',
            parameters: {
                groupId: 'demo',
                rollout: 20,
                stickiness: 'default',
            },
        })
        .expect(200)
        .expect((res) => {
            strategy = res.body;
        });

    await app.request
        .patch(
            `${BASE_URI}/features/${featureName}/environments/${envName}/strategies/${strategy.id}`,
        )
        .send([{ op: 'replace', path: '/parameters/rollout', value: 42 }])
        .expect(200);
    await app.request
        .get(
            `${BASE_URI}/features/${featureName}/environments/${envName}/strategies/${strategy.id}`,
        )
        .expect(200)
        .expect((res) => {
            expect(res.body.parameters.rollout).toBe(42);
        });
});

test('Trying to get a non existing feature strategy should yield 404', async () => {
    const envName = 'feature.non.existing.strategy.get';
    // Create environment
    await db.stores.environmentStore.create({
        name: envName,
        type: 'production',
    });
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

test('Can not enable environment for feature without strategies', async () => {
    const environment = 'some-env';
    const featureName = 'com.test.enable.environment.disabled';

    // Create environment
    await db.stores.environmentStore.create({
        name: environment,
        type: 'test',
    });
    // Connect environment to project
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({ environment })
        .expect(200);

    // Create feature
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: featureName,
        })
        .set('Content-Type', 'application/json')
        .expect(201);
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${environment}/on`,
        )
        .set('Content-Type', 'application/json')
        .expect(403);
    await app.request
        .get(`/api/admin/projects/default/features/${featureName}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            const enabledFeatureEnv = res.body.environments.find(
                (e) => e.name === environment,
            );
            expect(enabledFeatureEnv.enabled).toBe(false);
            expect(enabledFeatureEnv.type).toBe('test');
        });
});

test('Deleting a strategy should include name of feature strategy was deleted from', async () => {
    const environment = 'delete_strategy_env';
    const featureName = 'delete_strategy_feature';
    // Create environment
    await db.stores.environmentStore.create({
        name: environment,
        type: 'test',
    });
    // Connect environment to project
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({ environment })
        .expect(200);

    // Create feature
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: featureName,
        })
        .set('Content-Type', 'application/json')
        .expect(201);
    let strategyId;
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${environment}/strategies`,
        )
        .send({ name: 'default', constraints: [], properties: {} })
        .expect(200)
        .expect((res) => {
            strategyId = res.body.id;
        });
    expect(strategyId).toBeTruthy();
    // Delete strategy
    await app.request
        .delete(
            `/api/admin/projects/default/features/${featureName}/environments/${environment}/strategies/${strategyId}`,
        )
        .expect(200);
    const events = await db.stores.eventStore.getAll({
        type: FEATURE_STRATEGY_REMOVE,
    });
    expect(events).toHaveLength(1);
    expect(events[0].data.featureName).toBe(featureName);
    expect(events[0].environment).toBe(environment);
    expect(events[0].data.id).toBe(strategyId);
});

test('Enabling environment creates a FEATURE_ENVIRONMENT_ENABLED event', async () => {
    const environment = 'environment_enabled_env';
    const featureName = 'com.test.enable.environment.event.sent';

    // Create environment
    await db.stores.environmentStore.create({
        name: environment,
        type: 'test',
    });
    // Connect environment to project
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({ environment })
        .expect(200);

    // Create feature
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: featureName,
        })
        .set('Content-Type', 'application/json')
        .expect(201);
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${environment}/strategies`,
        )
        .send({ name: 'default', constraints: [], properties: {} })
        .expect(200);

    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${environment}/on`,
        )
        .set('Content-Type', 'application/json')
        .expect(200);
    const events = await db.stores.eventStore.getAll({
        type: FEATURE_ENVIRONMENT_ENABLED,
    });
    const enabledEvents = events.filter((e) => e.data.name === featureName);
    expect(enabledEvents).toHaveLength(1);
});
test('Disabling environment creates a FEATURE_ENVIRONMENT_DISABLED event', async () => {
    const environment = 'environment_disabled_env';
    const featureName = 'com.test.enable.environment_disabled.sent';

    // Create environment
    await db.stores.environmentStore.create({
        name: environment,
        type: 'test',
    });
    // Connect environment to project
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({ environment })
        .expect(200);

    // Create feature
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: featureName,
        })
        .set('Content-Type', 'application/json')
        .expect(201);
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${environment}/strategies`,
        )
        .send({ name: 'default', constraints: [], properties: {} })
        .expect(200);

    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${environment}/off`,
        )
        .set('Content-Type', 'application/json')
        .expect(200);

    const events = await db.stores.eventStore.getAll({
        type: FEATURE_ENVIRONMENT_DISABLED,
    });
    const ourFeatureEvent = events.find((e) => e.data.name === featureName);
    expect(ourFeatureEvent).toBeTruthy();
});

test('Can delete strategy from feature toggle', async () => {
    const envName = 'del-strategy';
    const featureName = 'feature.strategy.toggle.delete.strategy';
    // Create environment
    await db.stores.environmentStore.create({
        name: envName,
        type: 'test',
    });
    // Connect environment to project
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envName,
        })
        .expect(200);

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
    const { body } = await app.request.get(
        `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies`,
    );
    const strategies = body;
    const strategyId = strategies[0].id;
    await app.request
        .delete(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies/${strategyId}`,
        )
        .expect(200);
});

test('List of strategies should respect sortOrder', async () => {
    const envName = 'sortOrderdel-strategy';
    const featureName = 'feature.sort.order.one';
    // Create environment
    await db.stores.environmentStore.create({
        name: envName,
        type: 'test',
    });
    // Connect environment to project
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envName,
        })
        .expect(200);
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);
    await addStrategies(featureName, envName);
    const { body } = await app.request.get(
        `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies`,
    );
    const strategies = body;
    expect(strategies[0].sortOrder).toBe(sortOrderFirst);
    expect(strategies[1].sortOrder).toBe(sortOrderSecond);
    expect(strategies[2].sortOrder).toBe(sortOrderDefault);
});

test('Feature strategies list should respect strategy sortorders for each environment', async () => {
    const envName = 'sort-order-within-environment-one';
    const secondEnv = 'sort-order-within-environment-two';
    const featureName = 'feature.sort.order.environment.list';
    // Create environment
    await db.stores.environmentStore.create({
        name: envName,
        type: 'test',
    });
    await db.stores.environmentStore.create({
        name: secondEnv,
        type: 'test',
    });
    // Connect environment to project
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envName,
        })
        .expect(200);
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: secondEnv,
        })
        .expect(200);

    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);

    await addStrategies(featureName, envName);
    await addStrategies(featureName, secondEnv);

    const response = await app.request.get(
        `/api/admin/projects/default/features/${featureName}`,
    );
    const { body } = response;
    let { strategies } = body.environments.find((e) => e.name === envName);
    expect(strategies[0].sortOrder).toBe(sortOrderFirst);
    expect(strategies[1].sortOrder).toBe(sortOrderSecond);
    expect(strategies[2].sortOrder).toBe(sortOrderDefault);
    strategies = body.environments.find((e) => e.name === secondEnv).strategies;
    expect(strategies[0].sortOrder).toBe(sortOrderFirst);
    expect(strategies[1].sortOrder).toBe(sortOrderSecond);
    expect(strategies[2].sortOrder).toBe(sortOrderDefault);
});

test('Deleting last strategy for feature environment should disable that environment', async () => {
    const envName = 'last_strategy_delete_env';
    const featureName = 'last_strategy_delete_feature';
    // Create environment
    await db.stores.environmentStore.create({
        name: envName,
        type: 'test',
    });
    // Connect environment to project
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envName,
        })
        .expect(200);
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);
    let strategyId;
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
            strategyId = res.body.id;
        });
    // Enable feature_environment
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/on`,
        )
        .send({})
        .expect(200);
    await app.request
        .get(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}`,
        )
        .expect(200)
        .expect((res) => {
            expect(res.body.enabled).toBeTruthy();
        });
    // Delete last strategy, this should also disable the environment
    await app.request.delete(
        `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies/${strategyId}`,
    );
    await app.request
        .get(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}`,
        )
        .expect(200)
        .expect((res) => {
            expect(res.body.enabled).toBeFalsy();
        });
});

test('Deleting strategy for feature environment should not disable that environment as long as there are other strategies', async () => {
    const envName = 'any_strategy_delete_env';
    const featureName = 'any_strategy_delete_feature';
    // Create environment
    await db.stores.environmentStore.create({
        name: envName,
        type: 'test',
    });
    // Connect environment to project
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envName,
        })
        .expect(200);
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);
    let strategyId;
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
            strategyId = res.body.id;
        });
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies`,
        )
        .send({
            name: 'default',
            parameters: {
                customerId: 'string',
            },
        })
        .expect(200);
    // Enable feature_environment
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/on`,
        )
        .send({})
        .expect(200);
    await app.request
        .get(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}`,
        )
        .expect(200)
        .expect((res) => {
            expect(res.body.enabled).toBeTruthy();
        });
    // Delete a strategy, this should also disable the environment
    await app.request.delete(
        `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies/${strategyId}`,
    );
    await app.request
        .get(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}`,
        )
        .expect(200)
        .expect((res) => {
            expect(res.body.enabled).toBeTruthy();
        });
});

test('should clone feature toggle without strategies', async () => {
    const envName = 'some-env-3';
    const featureName = 'feature.toggle.base';
    const cloneName = 'feature.toggle.clone';
    const type = 'eExperiment';
    const description = 'Lorem ipsum...';

    // Create environment
    await db.stores.environmentStore.create({
        name: envName,
        type: 'production',
    });
    // Connect environment to project
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envName,
        })
        .expect(200);

    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName, description, type })
        .expect(201);
    await app.request
        .post(`/api/admin/projects/default/features/${featureName}/clone`)
        .send({ name: cloneName, replaceGroupId: false })
        .expect(201);
    await app.request
        .get(`/api/admin/projects/default/features/${cloneName}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.name).toBe(cloneName);
            expect(res.body.type).toBe(type);
            expect(res.body.project).toBe('default');
            expect(res.body.description).toBe(description);
        });
});

test('should clone feature toggle WITH strategies', async () => {
    const envName = 'some-env-4';
    const featureName = 'feature.toggle.base.2';
    const cloneName = 'feature.toggle.clone.2';
    const type = 'eExperiment';
    const description = 'Lorem ipsum...';

    // Create environment
    await db.stores.environmentStore.create({
        name: envName,
        type: 'production',
    });
    // Connect environment to project
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envName,
        })
        .expect(200);

    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName, description, type })
        .expect(201);
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies`,
        )
        .send({
            name: 'flexibleRollout',
            parameters: {
                groupId: featureName,
            },
        })
        .expect(200);

    await app.request
        .post(`/api/admin/projects/default/features/${featureName}/clone`)
        .send({ name: cloneName })
        .expect(201);
    await app.request
        .get(`/api/admin/projects/default/features/${cloneName}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.name).toBe(cloneName);
            expect(res.body.type).toBe(type);
            expect(res.body.project).toBe('default');
            expect(res.body.description).toBe(description);

            const env = res.body.environments.find((e) => e.name === envName);
            expect(env.strategies).toHaveLength(1);
            expect(env.strategies[0].parameters.groupId).toBe(cloneName);
        });
});

test('should clone feature toggle without replacing groupId', async () => {
    const envName = 'default';
    const featureName = 'feature.toggle.base.3';
    const cloneName = 'feature.toggle.clone.3';

    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies`,
        )
        .send({
            name: 'flexibleRollout',
            parameters: {
                groupId: featureName,
            },
        })
        .expect(200);

    await app.request
        .post(`/api/admin/projects/default/features/${featureName}/clone`)
        .send({ name: cloneName, replaceGroupId: false })
        .expect(201);
    await app.request
        .get(`/api/admin/projects/default/features/${cloneName}`)
        .expect(200)
        .expect((res) => {
            const env = res.body.environments.find((e) => e.name === envName);
            expect(env.strategies).toHaveLength(1);
            expect(env.strategies[0].parameters.groupId).toBe(featureName);
        });
});