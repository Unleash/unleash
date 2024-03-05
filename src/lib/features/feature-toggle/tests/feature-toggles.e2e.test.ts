import dbInit, { ITestDb } from '../../../../test/e2e/helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper';
import getLogger from '../../../../test/fixtures/no-logger';
import { DEFAULT_ENV } from '../../../util/constants';
import {
    FEATURE_ENVIRONMENT_DISABLED,
    FEATURE_ENVIRONMENT_ENABLED,
    FEATURE_METADATA_UPDATED,
    FEATURE_STALE_OFF,
    FEATURE_STALE_ON,
    FEATURE_STRATEGY_REMOVE,
} from '../../../types/events';
import ApiUser from '../../../types/api-user';
import { ApiTokenType } from '../../../types/models/api-token';
import IncompatibleProjectError from '../../../error/incompatible-project-error';
import {
    IStrategyConfig,
    IVariant,
    RoleName,
    WeightType,
} from '../../../types/model';
import { v4 as uuidv4 } from 'uuid';
import supertest from 'supertest';
import { randomId } from '../../../util/random-id';
import { DEFAULT_PROJECT } from '../../../types';
import {
    FeatureStrategySchema,
    SetStrategySortOrderSchema,
} from '../../../openapi';
import { ForbiddenError } from '../../../error';

let app: IUnleashTest;
let db: ITestDb;
const sortOrderFirst = 0;
const sortOrderSecond = 10;
const TESTUSERID = 3333;

const createSegment = async (segmentName: string) => {
    const segment = await app.services.segmentService.create(
        {
            name: segmentName,
            description: '',
            constraints: [
                {
                    contextName: 'appName',
                    operator: 'IN',
                    values: ['test'],
                    caseInsensitive: false,
                    inverted: false,
                },
            ],
        },
        { username: 'testuser', email: 'test@test.com' },
    );

    return segment;
};

const createStrategy = async (
    featureName: string,
    payload: IStrategyConfig,
    expectedCode = 200,
) => {
    return app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/default/strategies`,
        )
        .send(payload)
        .expect(expectedCode);
};

const updateStrategy = async (
    featureName: string,
    strategyId: string,
    payload: IStrategyConfig,
    expectedCode = 200,
) => {
    const { body } = await app.request
        .put(
            `/api/admin/projects/default/features/${featureName}/environments/default/strategies/${strategyId}`,
        )
        .send(payload)
        .expect(expectedCode);

    return body;
};

beforeAll(async () => {
    db = await dbInit('feature_strategy_api_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterEach(async () => {
    const all =
        await db.stores.projectStore.getEnvironmentsForProject('default');
    await Promise.all(
        all
            .filter((env) => env.environment !== DEFAULT_ENV)
            .map(async (env) =>
                db.stores.projectStore.deleteEnvironmentForProject(
                    'default',
                    env.environment,
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
        .post('/api/admin/projects/default/features')
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
            expect(
                r.body.details[0].message.includes('environment'),
            ).toBeTruthy();
            expect(r.body.details[0].message.includes('project')).toBeTruthy();
        });
});

test('Can get project overview', async () => {
    await app.request
        .post('/api/admin/projects/default/features')
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

test('should list dependencies and children', async () => {
    const parent = uuidv4();
    const child = uuidv4();
    await app.createFeature(parent, 'default');
    await app.createFeature(child, 'default');
    await app.addDependency(child, parent);

    const { body: childFeature } = await app.getProjectFeatures(
        'default',
        child,
    );
    const { body: parentFeature } = await app.getProjectFeatures(
        'default',
        parent,
    );

    expect(childFeature).toMatchObject({
        children: [],
        dependencies: [{ feature: parent, enabled: true, variants: [] }],
    });
    expect(parentFeature).toMatchObject({
        children: [child],
        dependencies: [],
    });
});

test('should not allow to change project with dependencies', async () => {
    const parent = uuidv4();
    const child = uuidv4();
    await app.createFeature(parent, 'default');
    await app.createFeature(child, 'default');
    await app.addDependency(child, parent);
    const user = new ApiUser({
        tokenName: 'project-changer',
        permissions: ['ADMIN'],
        project: '*',
        type: ApiTokenType.ADMIN,
        environment: '*',
        secret: 'a',
    });

    await expect(async () =>
        app.services.projectService.changeProject(
            'default',
            child,
            // @ts-ignore
            user,
            'default',
        ),
    ).rejects.toThrow(
        new ForbiddenError(
            'Changing project not allowed. Feature has dependencies.',
        ),
    );
});

test('Should not allow to archive/delete feature with children', async () => {
    const parent = uuidv4();
    const child = uuidv4();
    await app.createFeature(parent, 'default');
    await app.createFeature(child, 'default');
    await app.addDependency(child, parent);

    const { body: archiveBody } = await app.request
        .delete(`/api/admin/projects/default/features/${parent}`)
        .expect(403);
    const { body: deleteBody } = await app.request
        .post(`/api/admin/projects/default/delete`)
        .set('Content-Type', 'application/json')
        .send({ features: [parent] })
        .expect(403);
    expect(archiveBody.message).toBe(
        'You can not archive/delete this feature since other features depend on it.',
    );
    expect(deleteBody.message).toBe(
        'You can not archive/delete this feature since other features depend on it.',
    );
});

test('Should allow to archive/delete feature with children if no orphans are left', async () => {
    const parent = uuidv4();
    const child = uuidv4();
    await app.createFeature(parent, 'default');
    await app.createFeature(child, 'default');
    await app.addDependency(child, parent);

    const { body: deleteBody } = await app.request
        .post(`/api/admin/projects/default/delete`)
        .set('Content-Type', 'application/json')
        .send({ features: [parent, child] })
        .expect(200);
});

test('Should not allow to archive/delete feature when orphans are left', async () => {
    const parent = uuidv4();
    const child = uuidv4();
    const orphan = uuidv4();
    await app.createFeature(parent, 'default');
    await app.createFeature(child, 'default');
    await app.createFeature(orphan, 'default');
    await app.addDependency(child, parent);
    await app.addDependency(orphan, parent);

    const { body: deleteBody } = await app.request
        .post(`/api/admin/projects/default/delete`)
        .set('Content-Type', 'application/json')
        .send({ features: [parent, child] })
        .expect(403);

    expect(deleteBody.message).toBe(
        'You can not archive/delete those features since other features depend on them.',
    );
});

test('should clone feature with parent dependencies', async () => {
    const parent = uuidv4();
    const child = uuidv4();
    const childClone = uuidv4();
    await app.createFeature(parent, 'default');
    await app.createFeature(child, 'default');
    await app.addDependency(child, parent);

    await app.request
        .post(`/api/admin/projects/default/features/${child}/clone`)
        .send({ name: childClone, replaceGroupId: false })
        .expect(201);

    const { body: clonedFeature } = await app.getProjectFeatures(
        'default',
        child,
    );
    expect(clonedFeature).toMatchObject({
        children: [],
        dependencies: [{ feature: parent, enabled: true, variants: [] }],
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
        .post('/api/admin/projects/default/features')
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
        .post('/api/admin/projects/default/features')
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
    const project = 'default';
    // Create environment
    await db.stores.environmentStore.create({
        name: envName,
        type: 'production',
    });
    // Connect environment to project
    await app.request
        .post(`/api/admin/projects/${project}/environments`)
        .send({
            environment: envName,
        })
        .expect(200);

    // Create feature
    await app.createFeature(featureName).expect((res) => {
        expect(res.body.name).toBe(featureName);
        expect(res.body.createdAt).toBeTruthy();
    });

    // Add strategy to it
    await app.request
        .post(
            `/api/admin/projects/${project}/features/${featureName}/environments/${envName}/strategies`,
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
            `/api/admin/projects/${project}/features/${featureName}/environments/${envName}/on`,
        )
        .set('Content-Type', 'application/json')
        .expect(200);
    await app.getProjectFeatures(project, featureName).expect((res) => {
        const enabledFeatureEnv = res.body.environments.find(
            (e) => e.name === 'enable-feature-environment',
        );
        expect(enabledFeatureEnv).toBeTruthy();
        expect(enabledFeatureEnv.enabled).toBe(true);
    });
    await app.request
        .post(
            `/api/admin/projects/${project}/features/${featureName}/environments/${envName}/off`,
        )
        .send({})
        .expect(200);
    await app.getProjectFeatures(project, featureName).expect((res) => {
        const disabledFeatureEnv = res.body.environments.find(
            (e) => e.name === 'enable-feature-environment',
        );
        expect(disabledFeatureEnv).toBeTruthy();
        expect(disabledFeatureEnv.enabled).toBe(false);
    });
});

test('Can bulk enable/disable environment for feature with strategies', async () => {
    const envName = 'bulk-enable-feature-environment';
    const featureName = 'com.test.bulk.enable.environment';
    const project = 'default';
    // Create environment
    await db.stores.environmentStore.create({
        name: envName,
        type: 'production',
    });
    // Connect environment to project
    await app.request
        .post(`/api/admin/projects/${project}/environments`)
        .send({
            environment: envName,
        })
        .expect(200);

    // Create feature
    await app.createFeature(featureName).expect((res) => {
        expect(res.body.name).toBe(featureName);
        expect(res.body.createdAt).toBeTruthy();
    });

    // Add strategy to it
    await app.request
        .post(
            `/api/admin/projects/${project}/features/${featureName}/environments/${envName}/strategies`,
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
            `/api/admin/projects/${project}/bulk_features/environments/${envName}/on`,
        )
        .send({ features: [featureName] })
        .set('Content-Type', 'application/json')
        .expect(200);
    await app.getProjectFeatures(project, featureName).expect((res) => {
        const enabledFeatureEnv = res.body.environments.find(
            (e) => e.name === envName,
        );
        expect(enabledFeatureEnv).toBeTruthy();
        expect(enabledFeatureEnv.enabled).toBe(true);
    });

    await app.request
        .post(
            `/api/admin/projects/${project}/bulk_features/environments/${envName}/off`,
        )
        .send({ features: [featureName] })
        .expect(200);
    await app.getProjectFeatures(project, featureName).expect((res) => {
        const disabledFeatureEnv = res.body.environments.find(
            (e) => e.name === envName,
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

describe('Interacting with features using project IDs that belong to other projects', () => {
    const otherProject = 'project2';
    const featureName = 'new-toggle';
    const nonExistingProject = 'this-is-not-a-project';

    beforeAll(async () => {
        const dummyAdmin = await app.services.userService.createUser({
            name: 'Some Name',
            email: 'test@getunleash.io',
            rootRole: RoleName.ADMIN,
        });
        await app.services.projectService.createProject(
            {
                name: otherProject,
                id: otherProject,
                mode: 'open',
                defaultStickiness: 'clientId',
            },
            dummyAdmin,
        );

        // ensure the new project has been created
        await app.request
            .get(`/api/admin/projects/${otherProject}`)
            .expect(200);

        // create toggle in default project
        await app.request
            .post('/api/admin/projects/default/features')
            .send({ name: featureName })
            .expect(201);
    });

    afterAll(async () => {
        await db.stores.projectStore.delete(otherProject);
        await db.stores.featureToggleStore.delete(featureName);
        await db.stores.userStore.deleteAll();
    });

    test("Getting a feature yields 404 if the provided project id doesn't match the feature's project", async () => {
        await app.request
            .get(`/api/admin/projects/${otherProject}/features/${featureName}`)
            .expect(404);
    });

    test("Getting a feature yields 404 if the provided project doesn't exist", async () => {
        await app.request
            .get(
                `/api/admin/projects/${nonExistingProject}/features/${featureName}`,
            )
            .expect(404);
    });

    test("Archiving a feature yields 404 if the provided project id doesn't match the feature's project", async () => {
        await app.request
            .delete(
                `/api/admin/projects/${otherProject}/features/${featureName}`,
            )
            .expect(404);
    });

    test("Archiving a feature yields 404 if the provided project doesn't exist", async () => {
        await app.request
            .delete(
                `/api/admin/projects/${nonExistingProject}/features/${featureName}`,
            )
            .expect(404);
    });

    test("Trying to archive a feature that doesn't exist should yield a 404, regardless of whether the project exists or not.", async () => {
        await app.request
            .delete(
                `/api/admin/projects/${nonExistingProject}/features/${
                    featureName + featureName
                }`,
            )
            .expect(404);

        await app.request
            .delete(
                `/api/admin/projects/${otherProject}/features/${
                    featureName + featureName
                }`,
            )
            .expect(404);
    });
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
        .send({
            name,
            description: 'some',
            type: 'release',
            impressionData: true,
        })
        .expect(201);
    await app.request
        .patch(`${url}/${name}`)
        .send([
            { op: 'replace', path: '/description', value: 'New desc' },
            { op: 'replace', path: '/type', value: 'kill-switch' },
            { op: 'replace', path: '/impressionData', value: false },
        ])
        .expect(200);

    const { body: toggle } = await app.request.get(`${url}/${name}`);

    expect(toggle.name).toBe(name);
    expect(toggle.description).toBe('New desc');
    expect(toggle.type).toBe('kill-switch');
    expect(toggle.impressionData).toBe(false);
    expect(toggle.archived).toBeFalsy();
    const events = await db.stores.eventStore.getAll({
        type: FEATURE_METADATA_UPDATED,
    });
    const updateForOurToggle = events.find((e) => e.data.name === name);
    expect(updateForOurToggle).toBeTruthy();
    expect(updateForOurToggle?.data.description).toBe('New desc');
    expect(updateForOurToggle?.data.type).toBe('kill-switch');
});

test('Should patch feature toggle and not remove variants', async () => {
    const url = '/api/admin/projects/default/features';
    const name = 'new.toggle.variants';
    await app.request
        .post(url)
        .send({ name, description: 'some', type: 'release' })
        .expect(201);
    await app.request
        .put(`${url}/${name}/variants`)
        .send([
            {
                name: 'variant1',
                weightType: 'variable',
                weight: 500,
                stickiness: 'default',
            },
            {
                name: 'variant2',
                weightType: 'variable',
                weight: 500,
                stickiness: 'default',
            },
        ])
        .expect(200);
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
    expect(toggle.variants).toHaveLength(2);
});

test('Patching feature toggles to stale should trigger FEATURE_STALE_ON event', async () => {
    const url = '/api/admin/projects/default/features';
    const name = 'toggle.stale.on.patch';
    await app.request
        .post(url)
        .send({ name, description: 'some', type: 'release', stale: false })
        .expect(201);
    await app.request
        .patch(`${url}/${name}`)
        .send([{ op: 'replace', path: '/stale', value: true }])
        .expect(200);

    const { body: toggle } = await app.request.get(`${url}/${name}`);

    expect(toggle.name).toBe(name);
    expect(toggle.archived).toBeFalsy();
    expect(toggle.stale).toBeTruthy();
    const events = await db.stores.eventStore.getAll({
        type: FEATURE_STALE_ON,
    });
    const updateForOurToggle = events.find((e) => e.featureName === name);
    expect(updateForOurToggle).toBeTruthy();
});

test('Trying to patch variants on a feature toggle should trigger an OperationDeniedError', async () => {
    const url = '/api/admin/projects/default/features';
    const name = 'toggle.variants.on.patch';
    await app.request
        .post(url)
        .send({ name, description: 'some', type: 'release', stale: false });
    await app.request
        .patch(`${url}/${name}`)
        .send([
            {
                op: 'add',
                path: '/variants/1',
                value: {
                    name: 'variant',
                    weightType: 'variable',
                    weight: 500,
                    stickiness: 'default',
                },
            },
        ])
        .expect(403)
        .expect((res) => {
            expect(res.body.message.includes('PATCH')).toBeTruthy();
            expect(
                res.body.message.includes(
                    '/api/admin/projects/:project/features/:feature/variants',
                ),
            ).toBeTruthy();
        });
});

test('Patching feature toggles to active (turning stale to false) should trigger FEATURE_STALE_OFF event', async () => {
    const url = '/api/admin/projects/default/features';
    const name = 'toggle.stale.off.patch';
    await app.request
        .post(url)
        .send({ name, description: 'some', type: 'release', stale: true })
        .expect(201);
    await app.request
        .patch(`${url}/${name}`)
        .send([{ op: 'replace', path: '/stale', value: false }])
        .expect(200);

    const { body: toggle } = await app.request.get(`${url}/${name}`);

    expect(toggle.name).toBe(name);
    expect(toggle.archived).toBeFalsy();
    expect(toggle.stale).toBe(false);
    const events = await db.stores.eventStore.getAll({
        type: FEATURE_STALE_OFF,
    });
    const updateForOurToggle = events.find((e) => e.featureName === name);
    expect(updateForOurToggle).toBeTruthy();
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
        .send({ name: 'default', parameters: { userId: 'string' } })
        .expect(200);
    await app.request
        .get(`/api/admin/projects/default/features/${featureName}`)
        .expect((res) => {
            const env = res.body.environments.find((e) => e.name === envName);
            expect(env.strategies).toHaveLength(1);
        });
});

test('Can update strategy on feature toggle', async () => {
    const envName = 'default';
    const featureName = 'feature.strategy.update.strat';
    const projectPath = '/api/admin/projects/default';
    const featurePath = `${projectPath}/features/${featureName}`;

    // create feature toggle
    await app.request
        .post(`${projectPath}/features`)
        .send({ name: featureName })
        .expect(201);

    // add strategy
    const { body: strategy } = await app.request
        .post(`${featurePath}/environments/${envName}/strategies`)
        .send({ name: 'default', parameters: { userIds: '' } })
        .expect(200);

    // update strategy
    await app.request
        .put(`${featurePath}/environments/${envName}/strategies/${strategy.id}`)
        .send({ name: 'default', parameters: { userIds: 1234 } })
        .expect(200);

    const { body } = await app.request.get(`${featurePath}`);
    const defaultEnv = body.environments[0];
    expect(body.environments).toHaveLength(1);
    expect(defaultEnv.name).toBe(envName);
    expect(defaultEnv.strategies).toHaveLength(1);
    expect(defaultEnv.strategies[0].parameters).toStrictEqual({
        userIds: '1234',
    });
});

test('should coerce all strategy parameter values to strings', async () => {
    const envName = 'default';
    const featureName = randomId();
    const projectPath = '/api/admin/projects/default';
    const featurePath = `${projectPath}/features/${featureName}`;

    await app.request
        .post(`${projectPath}/features`)
        .send({ name: featureName })
        .expect(201);

    await app.request
        .post(`${featurePath}/environments/${envName}/strategies`)
        .send({ name: 'default', parameters: { foo: 1234 } })
        .expect(200);

    const { body } = await app.request.get(`${featurePath}`);
    const defaultEnv = body.environments[0];
    expect(defaultEnv.strategies).toHaveLength(1);
    expect(defaultEnv.strategies[0].parameters).toStrictEqual({
        foo: '1234',
    });
});

test('should NOT limit the length of parameter values', async () => {
    const envName = 'default';
    const featureName = randomId();
    const projectPath = '/api/admin/projects/default';
    const featurePath = `${projectPath}/features/${featureName}`;

    await app.request
        .post(`${projectPath}/features`)
        .send({ name: featureName })
        .expect(201);

    await app.request
        .post(`${featurePath}/environments/${envName}/strategies`)
        .send({ name: 'default', parameters: { foo: 'x'.repeat(101) } })
        .expect(200);
});

test('Can NOT delete strategy with wrong projectId', async () => {
    const envName = 'default';
    const featureName = 'feature.strategy.delete.strat.error';

    const projectPath = '/api/admin/projects/default';
    const featurePath = `${projectPath}/features/${featureName}`;

    // create feature toggle
    await app.request
        .post(`${projectPath}/features`)
        .send({ name: featureName })
        .expect(201);

    // add strategy
    const { body: strategy } = await app.request
        .post(`${featurePath}/environments/${envName}/strategies`)
        .send({
            name: 'default',
            parameters: {
                userIds: '',
            },
        })
        .expect(200);

    // delete strategy
    await app.request
        .delete(
            `/api/admin/projects/wrongId/features/${featureName}/environments/${envName}/strategies/${strategy.id}`,
        )
        .expect(403);
});

test('add strategy cannot use wrong projectId', async () => {
    const envName = 'default';
    const featureName = 'feature.strategy.add.strat.wrong.projectId';

    // create feature toggle
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);

    // add strategy
    await app.request
        .post(
            `/api/admin/projects/invalidId/features/${featureName}/environments/${envName}/strategies`,
        )
        .send({
            name: 'default',
            parameters: {
                userIds: '',
            },
        })
        .expect(404);
});

test('update strategy on feature toggle cannot use wrong projectId', async () => {
    const envName = 'default';
    const featureName = 'feature.strategy.update.strat.wrong.projectId';

    const projectPath = '/api/admin/projects/default';
    const featurePath = `${projectPath}/features/${featureName}`;

    // create feature toggle
    await app.request
        .post(`${projectPath}/features`)
        .send({ name: featureName })
        .expect(201);

    // add strategy
    const { body: strategy } = await app.request
        .post(`${featurePath}/environments/${envName}/strategies`)
        .send({
            name: 'default',
            parameters: {
                userIds: '',
            },
        })
        .expect(200);

    // update strategy
    await app.request
        .put(
            `/api/admin/projects/invalidId/features/${featureName}/environments/${envName}/strategies/${strategy.id}`,
        )
        .send({
            name: 'default',
            parameters: {
                userIds: '1234',
            },
        })
        .expect(403);
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
    // biome-ignore lint/suspicious/noImplicitAnyLet: Due to assigning from res.body later on. we ignore the type here
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
    let strategy: { id: number } | undefined;
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
            `${BASE_URI}/features/${featureName}/environments/${envName}/strategies/${
                strategy!.id
            }`,
        )
        .send([{ op: 'replace', path: '/parameters/rollout', value: 42 }])
        .expect(200);
    await app.request
        .get(
            `${BASE_URI}/features/${featureName}/environments/${envName}/strategies/${
                strategy!.id
            }`,
        )
        .expect(200)
        .expect((res) => {
            expect(res.body.parameters.rollout).toBe('42');
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

test('Can enable environment for feature without strategies', async () => {
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
        .expect(200);
    await app.request
        .get(`/api/admin/projects/default/features/${featureName}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            const enabledFeatureEnv = res.body.environments.find(
                (e) => e.name === environment,
            );
            expect(enabledFeatureEnv.enabled).toBe(true);
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
    let strategyId: number | undefined;
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${environment}/strategies`,
        )
        .send({ name: 'default', constraints: [] })
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
    expect(events[0].featureName).toBe(featureName);
    expect(events[0].environment).toBe(environment);
    expect(events[0].preData.id).toBe(strategyId);
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
        .send({ name: 'default', constraints: [] })
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
    const enabledEvents = events.filter((e) => e.featureName === featureName);
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
        .send({ name: 'default', constraints: [] })
        .expect(200);

    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${environment}/on`,
        )
        .set('Content-Type', 'application/json')
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
    const ourFeatureEvent = events.find((e) => e.featureName === featureName);
    expect(ourFeatureEvent).toBeTruthy();
});

test('Returns 400 when toggling environment of archived feature', async () => {
    const environment = 'environment_test_archived';
    const featureName = 'test_archived_feature';

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
    // Archive feature
    await app.request
        .delete(`/api/admin/projects/default/features/${featureName}`)
        .set('Content-Type', 'application/json')
        .expect(202);

    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${environment}/strategies`,
        )
        .send({ name: 'default', constraints: [] })
        .expect(200);

    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${environment}/on`,
        )
        .set('Content-Type', 'application/json')
        .expect(400);
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
    expect(strategies[0].sortOrder).toBe(0);
    expect(strategies[1].sortOrder).toBe(0);
    expect(strategies[2].sortOrder).toBe(10);
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
    expect(strategies[0].sortOrder).toBe(0);
    expect(strategies[1].sortOrder).toBe(0);
    expect(strategies[2].sortOrder).toBe(10);
    strategies = body.environments.find((e) => e.name === secondEnv).strategies;
    expect(strategies[0].sortOrder).toBe(0);
    expect(strategies[1].sortOrder).toBe(0);
    expect(strategies[2].sortOrder).toBe(10);
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
    let strategyId: number | undefined;
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
    let strategyId: number | undefined;
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

test('should clone feature toggle WITH variants', async () => {
    const envName = 'some-env-5';
    const featureName = 'feature.toggle.base.3';
    const cloneName = 'feature.toggle.clone.3';
    const type = 'eExperiment';
    const description = 'Lorem ipsum...';
    const variants = [
        { name: 'variant1', weight: 50 },
        { name: 'variant2', weight: 50 },
    ];

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
        .send({
            name: featureName,
            description,
            type,
            variants,
        })
        .expect(201);
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

            expect(res.body.variants).toHaveLength(2);
            res.body.variants.forEach((variant, i) => {
                expect(variant.name).toBe(variants[i].name);
            });
        });
});

test('should clone feature toggle without replacing groupId', async () => {
    const envName = 'default';
    const featureName = 'feature.toggle.base.4';
    const cloneName = 'feature.toggle.clone.4';

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

test('should clone feature toggle WITHOUT createdAt field', async () => {
    const featureName = 'feature.toggle.base.5';
    const cloneName = 'feature.toggle.clone.5';
    const type = 'eExperiment';
    const description = 'Lorem ipsum...';
    const originalCreatedAt = new Date(2011, 11, 11);

    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: featureName,
            description,
            type,
            createdAt: originalCreatedAt,
        })
        .expect(201);

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
            expect(new Date(res.body.createdAt).getFullYear()).toBe(
                new Date().getFullYear(),
            );
            expect(res.body.createdAt).not.toBe('2011-12-11T00:00:00.000Z');
        });
});

test('Should not allow changing project to target project without the same enabled environments', async () => {
    const envNameNotInBoth = 'not-in-both';
    const featureName = 'feature.dont.allow.change.project';
    const project = 'default';
    const targetProject = 'target-for-disallowed-change';
    await db.stores.projectStore.create({
        name: 'Project to be moved to',
        id: targetProject,
        description: '',
        mode: 'open',
    });

    await db.stores.environmentStore.create({
        name: envNameNotInBoth,
        type: 'test',
        enabled: true,
        sortOrder: 500,
    });

    await db.stores.projectStore.addEnvironmentToProject(
        'default',
        envNameNotInBoth,
    );
    await db.stores.projectStore.addEnvironmentToProject(
        targetProject,
        'default',
    );

    await app.createFeature(featureName, project);
    await app.request
        .post(
            `/api/admin/projects/${project}/features/${featureName}/environments/default/strategies`,
        )
        .send({
            name: 'flexibleRollout',
            parameters: {
                groupId: featureName,
            },
        })
        .expect(200);
    await app.request
        .post(
            `/api/admin/projects/${project}/features/${featureName}/environments/${envNameNotInBoth}/strategies`,
        )
        .send({
            name: 'flexibleRollout',
            parameters: {
                groupId: featureName,
            },
        })
        .expect(200);
    await app.request
        .post(
            `/api/admin/projects/${project}/features/${featureName}/environments/default/on`,
        )
        .send({})
        .expect(200);
    await app.request
        .post(
            `/api/admin/projects/${project}/features/${featureName}/environments/${envNameNotInBoth}/on`,
        )
        .send({})
        .expect(200);
    const user = new ApiUser({
        tokenName: 'project-changer',
        permissions: ['ADMIN'],
        project: '*',
        type: ApiTokenType.ADMIN,
        environment: '*',
        secret: 'a',
    });
    await expect(async () =>
        app.services.projectService.changeProject(
            targetProject,
            featureName,
            //@ts-ignore
            user,
            'default',
        ),
    ).rejects.toThrow(new IncompatibleProjectError(targetProject));
});

test('Should allow changing project to target project with the same enabled environments', async () => {
    const inBoth = 'in-both';
    const featureName = 'feature.change.project';
    const project = 'default';
    const targetProject = 'target-for-change';
    await db.stores.projectStore.create({
        name: 'Project to be moved to',
        id: targetProject,
        description: '',
        mode: 'open',
    });

    await db.stores.environmentStore.create({
        name: inBoth,
        type: 'test',
        enabled: true,
        sortOrder: 500,
    });

    await db.stores.projectStore.addEnvironmentToProject('default', inBoth);
    await db.stores.projectStore.addEnvironmentToProject(
        targetProject,
        'default',
    );
    await db.stores.projectStore.addEnvironmentToProject(targetProject, inBoth);

    await app.createFeature(featureName, project);
    await app.request
        .post(
            `/api/admin/projects/${project}/features/${featureName}/environments/default/strategies`,
        )
        .send({
            name: 'flexibleRollout',
            parameters: {
                groupId: featureName,
            },
        })
        .expect(200);
    await app.request
        .post(
            `/api/admin/projects/${project}/features/${featureName}/environments/${inBoth}/strategies`,
        )
        .send({
            name: 'flexibleRollout',
            parameters: {
                groupId: featureName,
            },
        })
        .expect(200);
    await app.request
        .post(
            `/api/admin/projects/${project}/features/${featureName}/environments/default/on`,
        )
        .send({})
        .expect(200);
    await app.request
        .post(
            `/api/admin/projects/${project}/features/${featureName}/environments/${inBoth}/on`,
        )
        .send({})
        .expect(200);
    const user = new ApiUser({
        tokenName: 'project-changer',
        permissions: ['ADMIN'],
        project: '*',
        type: ApiTokenType.ADMIN,
        environment: '*',
        secret: 'a',
    });
    await expect(async () =>
        app.services.projectService.changeProject(
            targetProject,
            featureName,
            //@ts-ignore
            user,
            'default',
        ),
    ).resolves;
});

test(`a feature's variants should be sorted by name in increasing order`, async () => {
    const featureName = 'variants.are.sorted';
    const project = 'default';
    await app.createFeature(featureName, project);

    const newVariants: IVariant[] = [
        {
            name: 'z',
            stickiness: 'default',
            weight: 250,
            weightType: WeightType.FIX,
        },
        {
            name: 'f',
            stickiness: 'default',
            weight: 375,
            weightType: WeightType.VARIABLE,
        },
        {
            name: 'a',
            stickiness: 'default',
            weight: 450,
            weightType: WeightType.VARIABLE,
        },
    ];

    await app.request
        .put(`/api/admin/projects/${project}/features/${featureName}/variants`)
        .send(newVariants)
        .expect(200);

    await app.request
        .get(`/api/admin/projects/${project}/features/${featureName}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.variants[0].name).toBe('a');
            expect(res.body.variants[1].name).toBe('f');
            expect(res.body.variants[2].name).toBe('z');
        });
});

test('should validate context when calling update with PUT', async () => {
    const name = 'new.toggle.validate.context';
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name, description: 'some', type: 'release' })
        .expect(201);

    await app.request
        .put(`/api/admin/projects/another-project/features/${name}`)
        .send({ name, description: 'updated', type: 'kill-switch' })
        .expect((res) => {
            expect(res.body.name).toBe('NotFoundError');
        })
        .expect(404);
});

test('should validate context when calling update with PATCH', async () => {
    const name = 'new.toggle.validate.context2';
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name, description: 'some', type: 'release' })
        .expect(201);

    await app.request
        .patch(`/api/admin/projects/another-project/features/${name}`)
        .send([])
        .expect((res) => {
            expect(res.body.name).toBe('NotFoundError');
        })
        .expect(404);
});

test('should not update project with PUT', async () => {
    const name = 'new.toggle.validate.update.project.put';
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name, description: 'some', type: 'release' })
        .expect(201);

    await app.request
        .put(`/api/admin/projects/default/features/${name}`)
        .send({
            name,
            description: 'updated',
            type: 'kill-switch',
            project: 'new-project',
        })
        .expect((res) => {
            expect(res.body.project).toBe('default');
        })
        .expect(200);
});

test('should not update project with PATCH', async () => {
    const name = 'new.toggle.validate.update.project.patch';
    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name, description: 'some', type: 'release' })
        .expect(201);

    await app.request
        .patch(`/api/admin/projects/default/features/${name}`)
        .send([{ op: 'replace', path: '/project', value: 'new-project' }])
        .expect((res) => {
            expect(res.body.project).toBe('default');
        })
        .expect(200);
});

test('Can create a feature with impression data', async () => {
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'new.toggle.with.impressionData',
            impressionData: true,
        })
        .expect(201)
        .expect((res) => {
            expect(res.body.impressionData).toBe(true);
        });
});

test('Can create a feature without impression data', async () => {
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'new.toggle.without.impressionData',
        })
        .expect(201)
        .expect((res) => {
            expect(res.body.impressionData).toBe(false);
        });
});

test('Can update impression data with PUT', async () => {
    const toggle = {
        name: 'update.toggle.with.impressionData',
        impressionData: true,
    };
    await app.request
        .post('/api/admin/projects/default/features')
        .send(toggle)
        .expect(201)
        .expect((res) => {
            expect(res.body.impressionData).toBe(true);
        });

    await app.request
        .put(`/api/admin/projects/default/features/${toggle.name}`)
        .send({ ...toggle, impressionData: false })
        .expect(200)
        .expect((res) => {
            expect(res.body.impressionData).toBe(false);
        });
});

test('Can create toggle with impression data on different project', async () => {
    await db.stores.projectStore.create({
        id: 'impression-data',
        name: 'ImpressionData',
        description: '',
        mode: 'open',
    });

    const toggle = {
        name: 'project.impression.data',
        impressionData: true,
    };

    await app.request
        .post('/api/admin/projects/impression-data/features')
        .send(toggle)
        .expect(201)
        .expect((res) => {
            expect(res.body.impressionData).toBe(true);
        });

    await app.request
        .put(`/api/admin/projects/impression-data/features/${toggle.name}`)
        .send({ ...toggle, impressionData: false })
        .expect(200)
        .expect((res) => {
            expect(res.body.impressionData).toBe(false);
        });
});

test('should handle strategy variants', async () => {
    const feature = { name: uuidv4(), impressionData: false };
    await app.createFeature(feature.name);

    const strategyWithInvalidVariant = {
        name: 'flexibleRollout',
        constraints: [],
        variants: [
            {
                name: 'invalidVariant',
                weight: 1000,
                stickiness: 'default',
                weightType: 'fix',
            },
        ], // it should be variable
    };

    const variant = {
        name: 'variantName',
        weight: 1,
        weightType: 'variable' as const,
        stickiness: 'default',
    };
    const updatedVariant1 = {
        name: 'updatedVariant1',
        weight: 500,
        weightType: 'variable',
        stickiness: 'default',
    };
    const updatedVariant2 = {
        name: 'updatedVariant2',
        weight: 500,
        weightType: 'variable',
        stickiness: 'default',
    };
    const strategyWithValidVariant = {
        name: 'flexibleRollout',
        constraints: [],
        variants: [variant],
    };

    const featureStrategiesPath = `/api/admin/projects/default/features/${feature.name}/environments/default/strategies`;

    await app.request
        .post(featureStrategiesPath)
        .send(strategyWithInvalidVariant)
        .expect(400);

    await createStrategy(feature.name, strategyWithValidVariant);

    const { body: strategies } = await app.request.get(featureStrategiesPath);

    expect(strategies).toMatchObject([
        {
            variants: [{ ...variant, weight: 1000 }], // weight was fixed
        },
    ]);

    await updateStrategy(feature.name, strategies[0].id, {
        ...strategies[0],
        variants: [updatedVariant1, updatedVariant2],
    });

    const { body: updatedStrategies } = await app.request.get(
        featureStrategiesPath,
    );

    expect(updatedStrategies).toMatchObject([
        {
            variants: [updatedVariant1, updatedVariant2],
        },
    ]);
});

test('should reject invalid constraint values for multi-valued constraints', async () => {
    const project = await db.stores.projectStore.create({
        id: uuidv4(),
        name: uuidv4(),
        description: '',
        mode: 'open',
    });

    const toggle = await db.stores.featureToggleStore.create(project.id, {
        name: uuidv4(),
        impressionData: true,
        createdByUserId: 9999,
    });

    const mockStrategy = (values: string[]) => ({
        name: 'flexibleRollout',
        constraints: [{ contextName: 'userId', operator: 'IN', values }],
    });

    const featureStrategiesPath = `/api/admin/projects/${project.id}/features/${toggle.name}/environments/default/strategies`;

    await app.request
        .post(featureStrategiesPath)
        .send(mockStrategy([]))
        .expect(400);
    await app.request
        .post(featureStrategiesPath)
        .send(mockStrategy(['']))
        .expect(400);
    const { body: strategy } = await app.request
        .post(featureStrategiesPath)
        .send(mockStrategy(['a']))
        .expect(200);

    await app.request
        .put(`${featureStrategiesPath}/${strategy.id}`)
        .send(mockStrategy([]))
        .expect(400);
    await app.request
        .put(`${featureStrategiesPath}/${strategy.id}`)
        .send(mockStrategy(['']))
        .expect(400);
    await app.request
        .put(`${featureStrategiesPath}/${strategy.id}`)
        .send(mockStrategy(['a']))
        .expect(200);
});

test('should add default constraint values for single-valued constraints', async () => {
    const project = await db.stores.projectStore.create({
        id: uuidv4(),
        name: uuidv4(),
        description: '',
        mode: 'open',
    });

    const toggle = await db.stores.featureToggleStore.create(project.id, {
        name: uuidv4(),
        impressionData: true,
        createdByUserId: 9999,
    });

    const constraintValue = {
        contextName: 'userId',
        operator: 'NUM_EQ',
        value: '1',
    };

    const constraintValues = {
        contextName: 'userId',
        operator: 'IN',
        values: ['a', 'b', 'c'],
    };

    const mockStrategy = (constraint: unknown) => ({
        name: 'flexibleRollout',
        constraints: [constraint],
    });

    const expectValues = (res: supertest.Response, values: unknown[]) => {
        expect(res.body.constraints.length).toEqual(1);
        expect(res.body.constraints[0].values).toEqual(values);
    };

    const featureStrategiesPath = `/api/admin/projects/${project.id}/features/${toggle.name}/environments/default/strategies`;

    await app.request
        .post(featureStrategiesPath)
        .send(mockStrategy(constraintValue))
        .expect(200)
        .expect((res) => expectValues(res, []));
    const { body: strategy } = await app.request
        .post(featureStrategiesPath)
        .send(mockStrategy(constraintValues))
        .expect(200)
        .expect((res) => expectValues(res, constraintValues.values));

    await app.request
        .put(`${featureStrategiesPath}/${strategy.id}`)
        .send(mockStrategy(constraintValue))
        .expect(200)
        .expect((res) => expectValues(res, []));
    await app.request
        .put(`${featureStrategiesPath}/${strategy.id}`)
        .send(mockStrategy(constraintValues))
        .expect(200)
        .expect((res) => expectValues(res, constraintValues.values));
});

test('should allow long parameter values', async () => {
    const project = await db.stores.projectStore.create({
        id: uuidv4(),
        name: uuidv4(),
        description: uuidv4(),
        mode: 'open',
    });

    const toggle = await db.stores.featureToggleStore.create(project.id, {
        name: uuidv4(),
        createdByUserId: 9999,
    });

    const strategy = {
        name: 'flexibleRollout',
        parameters: { a: 'b'.repeat(500) },
    };

    await app.request
        .post(
            `/api/admin/projects/${project.id}/features/${toggle.name}/environments/default/strategies`,
        )
        .send(strategy)
        .expect(200);
});

test('should change strategy sort order when payload is valid', async () => {
    const toggle = { name: uuidv4(), impressionData: false };
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: toggle.name,
        })
        .expect(201);

    const { body: strategyOne } = await app.request
        .post(
            `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
        )
        .send({
            name: 'default',
            parameters: {
                userId: 'string',
            },
        })
        .expect(200);

    const { body: strategyTwo } = await app.request
        .post(
            `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
        )
        .send({
            name: 'flexibleRollout',
            parameters: {
                userId: 'string',
            },
        })
        .expect(200);

    const { body: strategies } = await app.request.get(
        `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
    );

    expect(strategies[0].sortOrder).toBe(0);
    expect(strategies[0].id).toBe(strategyOne.id);
    expect(strategies[1].sortOrder).toBe(1);
    expect(strategies[1].id).toBe(strategyTwo.id);

    await app.request
        .post(
            `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies/set-sort-order`,
        )
        .send([
            {
                id: strategyOne.id,
                sortOrder: 2,
            },
            {
                id: strategyTwo.id,
                sortOrder: 1,
            },
        ])
        .expect(200);

    const { body: strategiesOrdered } = await app.request.get(
        `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
    );

    expect(strategiesOrdered[0].sortOrder).toBe(1);
    expect(strategiesOrdered[0].id).toBe(strategyTwo.id);
    expect(strategiesOrdered[1].sortOrder).toBe(2);
    expect(strategiesOrdered[1].id).toBe(strategyOne.id);
});

test('should reject set sort order request when payload is invalid', async () => {
    const toggle = { name: uuidv4(), impressionData: false };

    await app.request
        .post(
            `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies/set-sort-order`,
        )
        .send([
            {
                id: '213141',
            },
            {
                id: '341123',
            },
        ])
        .expect(400);
});

test('should return strategies in correct order when new strategies are added', async () => {
    const toggle = { name: uuidv4(), impressionData: false };
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: toggle.name,
        })
        .expect(201);

    const { body: strategyOne } = await app.request
        .post(
            `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
        )
        .send({
            name: 'default',
            parameters: {
                userId: 'string',
            },
        })
        .expect(200);

    const { body: strategyTwo } = await app.request
        .post(
            `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
        )
        .send({
            name: 'flexibleRollout',
            parameters: {
                userId: 'string',
            },
        })
        .expect(200);

    const { body: strategies } = await app.request.get(
        `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
    );

    expect(strategies[0].sortOrder).toBe(0);
    expect(strategies[0].id).toBe(strategyOne.id);
    expect(strategies[1].sortOrder).toBe(1);
    expect(strategies[1].id).toBe(strategyTwo.id);

    await app.request
        .post(
            `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies/set-sort-order`,
        )
        .send([
            {
                id: strategyOne.id,
                sortOrder: 2,
            },
            {
                id: strategyTwo.id,
                sortOrder: 1,
            },
        ])
        .expect(200);

    const { body: strategyThree } = await app.request
        .post(
            `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
        )
        .send({
            name: 'flexibleRollout',
            parameters: {
                userId: 'string',
            },
        })
        .expect(200);

    const { body: strategyFour } = await app.request
        .post(
            `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
        )
        .send({
            name: 'flexibleRollout',
            parameters: {
                userId: 'string',
            },
        })
        .expect(200);

    const { body: strategiesOrdered } = await app.request.get(
        `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
    );

    expect(strategiesOrdered[0].sortOrder).toBe(1);
    expect(strategiesOrdered[0].id).toBe(strategyTwo.id);
    expect(strategiesOrdered[1].sortOrder).toBe(2);
    expect(strategiesOrdered[1].id).toBe(strategyOne.id);
    expect(strategiesOrdered[2].id).toBe(strategyThree.id);
    expect(strategiesOrdered[3].id).toBe(strategyFour.id);

    await app.request
        .post(
            `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies/set-sort-order`,
        )
        .send([
            {
                id: strategyFour.id,
                sortOrder: 0,
            },
        ])
        .expect(200);

    const { body: strategiesReOrdered } = await app.request.get(
        `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
    );

    // This block checks the order of the strategies retrieved from the endpoint. After partial update, the order should
    // change because the new element received a lower sort order than the previous objects.
    expect(strategiesReOrdered[0].sortOrder).toBe(0);
    expect(strategiesReOrdered[0].id).toBe(strategyFour.id);
    expect(strategiesReOrdered[1].sortOrder).toBe(1);
    expect(strategiesReOrdered[1].id).toBe(strategyTwo.id);
    expect(strategiesReOrdered[2].sortOrder).toBe(2);
    expect(strategiesReOrdered[2].id).toBe(strategyOne.id);
    expect(strategiesReOrdered[3].sortOrder).toBe(3);
    expect(strategiesReOrdered[3].id).toBe(strategyThree.id);
});

test('should create a strategy with segments', async () => {
    const feature = { name: uuidv4(), impressionData: false };
    await app.createFeature(feature.name);
    const segment = await createSegment('segmentOne');
    const { body: strategyOne } = await createStrategy(feature.name, {
        name: 'default',
        parameters: {
            userId: 'string',
        },
        segments: [segment.id],
    });

    // Can get the strategy with segment ids
    await app.request
        .get(`/api/admin/projects/default/features/${feature.name}`)
        .expect((res) => {
            const defaultEnv = res.body.environments.find(
                (env) => env.name === 'default',
            );
            const strategy = defaultEnv.strategies.find(
                (strat) => strat.id === strategyOne.id,
            );

            expect(strategy.segments).toEqual([segment.id]);
        });

    await updateStrategy(feature.name, strategyOne.id, {
        name: 'default',
        parameters: {
            userId: 'string',
        },
        segments: [],
    });

    await app.request
        .get(`/api/admin/projects/default/features/${feature.name}`)
        .expect((res) => {
            const defaultEnv = res.body.environments.find(
                (env) => env.name === 'default',
            );
            const strategy = defaultEnv.strategies.find(
                (strat) => strat.id === strategyOne.id,
            );

            expect(strategy.segments).toBe(undefined);
        });
});

test('should add multiple segments to a strategy', async () => {
    const feature = { name: uuidv4(), impressionData: false };
    await app.createFeature(feature.name);
    const segment = await createSegment('seg1');
    const segmentTwo = await createSegment('seg2');
    const segmentThree = await createSegment('seg3');
    const { body: strategyOne } = await createStrategy(feature.name, {
        name: 'default',
        parameters: {
            userId: 'string',
        },
        segments: [segment.id, segmentTwo.id, segmentThree.id],
    });

    // Can get the strategy with segment ids
    await app.request
        .get(`/api/admin/projects/default/features/${feature.name}`)
        .expect((res) => {
            const defaultEnv = res.body.environments.find(
                (env) => env.name === 'default',
            );
            const strategy = defaultEnv?.strategies.find(
                (strat) => strat.id === strategyOne.id,
            );

            expect(strategy.segments.sort()).toEqual([
                segment.id,
                segmentTwo.id,
                segmentThree.id,
            ]);
        });
});

test('Can filter based on tags', async () => {
    const tag = { type: 'simple', value: 'hello-tags' };
    await db.stores.tagStore.createTag(tag);
    await db.stores.featureToggleStore.create('default', {
        name: 'to-be-tagged',
        createdByUserId: 9999,
    });
    await db.stores.featureToggleStore.create('default', {
        name: 'not-tagged',
        createdByUserId: 9999,
    });
    await db.stores.featureTagStore.tagFeature('to-be-tagged', tag, TESTUSERID);
    await app.request
        .get('/api/admin/projects/default/features?tag=simple:hello-tags')
        .expect((res) => {
            expect(res.body.features).toHaveLength(1);
        });
});

test('Can query for features with namePrefix', async () => {
    await db.stores.featureToggleStore.create('default', {
        name: 'nameprefix-to-be-hit',
        createdByUserId: 9999,
    });
    await db.stores.featureToggleStore.create('default', {
        name: 'nameprefix-not-be-hit',
        createdByUserId: 9999,
    });
    await app.request
        .get('/api/admin/projects/default/features?namePrefix=nameprefix-to')
        .expect((res) => {
            expect(res.body.features).toHaveLength(1);
        });
});

test('Can query for features with namePrefix and tags', async () => {
    const tag = { type: 'simple', value: 'hello-nameprefix-tags' };
    await db.stores.tagStore.createTag(tag);
    await db.stores.featureToggleStore.create('default', {
        name: 'to-be-tagged-nameprefix-and-tags',
        createdByUserId: 9999,
    });
    await db.stores.featureToggleStore.create('default', {
        name: 'not-tagged-nameprefix-and-tags',
        createdByUserId: 9999,
    });
    await db.stores.featureToggleStore.create('default', {
        name: 'tagged-but-not-hit-nameprefix-and-tags',
        createdByUserId: 9999,
    });
    await db.stores.featureTagStore.tagFeature(
        'to-be-tagged-nameprefix-and-tags',
        tag,
        TESTUSERID,
    );
    await db.stores.featureTagStore.tagFeature(
        'tagged-but-not-hit-nameprefix-and-tags',
        tag,
        TESTUSERID,
    );
    await app.request
        .get(
            '/api/admin/projects/default/features?namePrefix=to&tag=simple:hello-nameprefix-tags',
        )
        .expect((res) => {
            expect(res.body.features).toHaveLength(1);
        });
});

test('Can query for two tags at the same time. Tags are ORed together', async () => {
    const tag = { type: 'simple', value: 'twotags-first-tag' };
    const secondTag = { type: 'simple', value: 'twotags-second-tag' };
    await db.stores.tagStore.createTag(tag);
    await db.stores.tagStore.createTag(secondTag);
    const taggedWithFirst = await db.stores.featureToggleStore.create(
        'default',
        {
            name: 'tagged-with-first-tag',
            createdByUserId: 9999,
        },
    );
    const taggedWithSecond = await db.stores.featureToggleStore.create(
        'default',
        {
            name: 'tagged-with-second-tag',
            createdByUserId: 9999,
        },
    );
    const taggedWithBoth = await db.stores.featureToggleStore.create(
        'default',
        {
            name: 'tagged-with-both-tags',
            createdByUserId: 9999,
        },
    );
    await db.stores.featureTagStore.tagFeature(
        taggedWithFirst.name,
        tag,
        TESTUSERID,
    );
    await db.stores.featureTagStore.tagFeature(
        taggedWithSecond.name,
        secondTag,
        TESTUSERID,
    );
    await db.stores.featureTagStore.tagFeature(
        taggedWithBoth.name,
        tag,
        TESTUSERID,
    );
    await db.stores.featureTagStore.tagFeature(
        taggedWithBoth.name,
        secondTag,
        TESTUSERID,
    );
    await app.request
        .get(
            `/api/admin/projects/default/features?tag=${tag.type}:${tag.value}&tag=${secondTag.type}:${secondTag.value}`,
        )
        .expect((res) => {
            expect(res.body.features).toHaveLength(3);
        });
});

test('Should batch stale features', async () => {
    const staledFeatureName1 = 'staledFeature1';
    const staledFeatureName2 = 'staledFeature2';

    await app.createFeature(staledFeatureName1);
    await app.createFeature(staledFeatureName2);

    await app.request
        .post(`/api/admin/projects/${DEFAULT_PROJECT}/stale`)
        .send({
            features: [staledFeatureName1, staledFeatureName2],
            stale: true,
        })
        .expect(202);

    const { body } = await app.request
        .get(
            `/api/admin/projects/${DEFAULT_PROJECT}/features/${staledFeatureName1}`,
        )
        .expect(200);
    expect(body.stale).toBeTruthy();
});

test('should return disabled strategies', async () => {
    const toggle = { name: uuidv4(), impressionData: false };
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: toggle.name,
        })
        .expect(201);

    const { body: strategyOne } = await app.request
        .post(
            `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
        )
        .send({
            name: 'default',
            parameters: {
                userId: 'string',
            },
            disabled: true,
        })
        .expect(200);

    const { body: strategyTwo } = await app.request
        .post(
            `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
        )
        .send({
            name: 'flexibleRollout',
            parameters: {
                userId: 'string',
            },
        })
        .expect(200);

    const { body: strategies } = await app.request.get(
        `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
    );

    expect(strategies[0].id).toBe(strategyOne.id);
    expect(strategies[0].disabled).toBe(strategyOne.disabled);
    expect(strategies[1].id).toBe(strategyTwo.id);
    expect(strategies[1].disabled).toBe(strategyTwo.disabled);
});

test('should disable strategies in place', async () => {
    const toggle = { name: uuidv4(), impressionData: false };
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: toggle.name,
        })
        .expect(201);

    const { body: strategyOne } = await app.request
        .post(
            `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
        )
        .send({
            name: 'flexibleRollout',
            constraints: [],
            parameters: {
                rollout: '100',
                stickiness: 'default',
                groupId: 'some-new',
            },
        })
        .expect(200);

    const { body: strategies } = await app.request.get(
        `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
    );

    expect(strategies[0].id).toBe(strategyOne.id);
    expect(strategies[0].disabled).toBe(false);

    const { body: updatedStrategyOne } = await app.request
        .put(
            `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies/${strategyOne.id}`,
        )
        .send({
            name: 'flexibleRollout',
            constraints: [],
            disabled: true,
            parameters: {
                rollout: '100',
                stickiness: 'default',
                groupId: 'some-new',
            },
        })
        .expect(200);

    const { body: updatedStrategies } = await app.request.get(
        `/api/admin/projects/default/features/${toggle.name}/environments/default/strategies`,
    );

    expect(updatedStrategies[0].id).toBe(updatedStrategyOne.id);
    expect(updatedStrategies[0].disabled).toBe(updatedStrategyOne.disabled);
});

test('Disabling last strategy for feature environment should disable that environment', async () => {
    const envName = 'last_strategy_disable_env';
    const featureName = 'last_strategy_disable_feature';
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
    let strategyId: number | undefined;
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
    // Disable last strategy, this should also disable the environment
    await app.request
        .patch(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies/${strategyId}`,
        )
        .send([
            {
                path: '/disabled',
                value: true,
                op: 'replace',
            },
        ])
        .expect(200);
    await app.request
        .get(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}`,
        )
        .expect(200)
        .expect((res) => {
            expect(res.body.enabled).toBeFalsy();
        });
});

test('Enabling a feature environment should add the default strategy when only disabled strategies', async () => {
    const envName = 'add_default_strategy';
    const featureName = 'add_default_strategy_feature';
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
    let strategyId: number | undefined;
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
    // Disable last strategy, this should also disable the environment
    await app.request
        .patch(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies/${strategyId}`,
        )
        .send([
            {
                path: '/disabled',
                value: true,
                op: 'replace',
            },
        ])
        .expect(200);
    await app.request
        .get(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}`,
        )
        .expect(200)
        .expect((res) => {
            expect(res.body.enabled).toBeFalsy();
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
            expect(res.body.strategies.length).toBe(2);
            expect(res.body.strategies[0].disabled).toBeTruthy();
            expect(res.body.strategies[1].disabled).toBeFalsy();
        });
});
test('Updating feature strategy sort-order should return strategies in correct order', async () => {
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    strategyVariant: true,
                },
            },
        },
        db.rawDatabase,
    );

    const envName = 'sort-order-within-environment-strategyVariant2';
    const featureName = 'feature.sort.order.event.list2';

    await db.stores.environmentStore.create({
        name: envName,
        type: 'test',
    });

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

    const strategies: FeatureStrategySchema[] = body;
    let order = 1;
    const sortOrders: SetStrategySortOrderSchema = [];

    strategies.forEach((strategy) => {
        sortOrders.push({ id: strategy.id!, sortOrder: order++ });
    });

    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies/set-sort-order`,
        )
        .send(sortOrders)
        .expect(200);

    await app.request
        .get(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}`,
        )
        .expect(200)
        .expect((res) => {
            expect(res.body.strategies.length).toBe(3);
            expect(res.body.strategies[0].sortOrder).toBe(1);
            expect(res.body.strategies[1].sortOrder).toBe(2);
            expect(res.body.strategies[2].sortOrder).toBe(3);
        });
});

test('Updating feature strategy sort-order should trigger a an event', async () => {
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: false,
                    strategyVariant: true,
                },
            },
        },
        db.rawDatabase,
    );

    const envName = 'sort-order-within-environment-strategyVariant';
    const featureName = 'feature.sort.order.event.list-strategyVariant';

    await db.stores.environmentStore.create({
        name: envName,
        type: 'test',
    });

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

    const strategies: FeatureStrategySchema[] = body;
    let order = 1;
    const sortOrders: SetStrategySortOrderSchema = [];

    strategies.forEach((strategy) => {
        sortOrders.push({ id: strategy.id!, sortOrder: order++ });
    });

    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${envName}/strategies/set-sort-order`,
        )
        .send(sortOrders)
        .expect(200);

    await app.request
        .get(`/api/admin/events`)
        .expect(200)
        .expect((res) => {
            expect(res.body.events[0].type).toBe('strategy-order-changed');
        });
});

test('should not be allowed to create with invalid strategy type name', async () => {
    const feature = { name: uuidv4(), impressionData: false };
    await app.createFeature(feature.name);
    await createStrategy(
        feature.name,
        {
            name: 'random-type',
            parameters: {
                userId: 'string',
            },
        },
        400,
    );
});

test('should not be allowed to update with invalid strategy type name', async () => {
    const feature = { name: uuidv4(), impressionData: false };
    await app.createFeature(feature.name);
    const { body: strategyOne } = await createStrategy(feature.name, {
        name: 'default',
        parameters: {
            userId: 'string',
        },
    });

    await updateStrategy(
        feature.name,
        strategyOne.id,
        {
            name: 'random-type',
            parameters: {
                userId: 'string',
            },
            segments: [],
        },
        400,
    );
});

test('should return correct data structure for /api/admin/features', async () => {
    await app.createFeature('refactor-features');

    const result = await app.request.get('/api/admin/features').expect(200);

    expect(result.body.features).toBeInstanceOf(Array);

    const feature = result.body.features.find(
        (features) => features.name === 'refactor-features',
    );

    expect(feature).toMatchObject({
        impressionData: false,
        enabled: false,
        name: 'refactor-features',
        description: null,
        project: 'default',
        stale: false,
        type: 'release',
        lastSeenAt: null,
        variants: [],
        favorite: false,
        createdAt: expect.anything(),
        strategies: [],
    });
});
