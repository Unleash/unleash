import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { DEFAULT_ENV } from '../../../../lib/util/constants.js';
import type User from '../../../../lib/types/user.js';
import {
    SYSTEM_USER_AUDIT,
    TEST_AUDIT_USER,
} from '../../../../lib/types/index.js';

let app: IUnleashTest;
let db: ITestDb;
const testUser = { name: 'test', id: -9999 } as User;

beforeAll(async () => {
    db = await dbInit('feature_api_client', getLogger);
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
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'featureX',
            description: 'the #1 feature',
            impressionData: true,
        },
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'featureY',
            description: 'soon to be the #1 feature',
        },
        TEST_AUDIT_USER,
    );

    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'featureZ',
            description: 'terrible feature',
        },
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'featureArchivedX',
            description: 'the #1 feature',
        },
        TEST_AUDIT_USER,
    );
    // depend on enabled feature with variant
    await app.services.dependentFeaturesService.unprotectedUpsertFeatureDependency(
        { child: 'featureY', projectId: 'default' },
        { feature: 'featureX', variants: ['featureXVariant'] },
        TEST_AUDIT_USER,
    );

    await app.services.featureToggleService.archiveToggle(
        'featureArchivedX',
        testUser,
        TEST_AUDIT_USER,
    );

    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'featureArchivedY',
            description: 'soon to be the #1 feature',
        },
        TEST_AUDIT_USER,
    );

    await app.services.featureToggleService.archiveToggle(
        'featureArchivedY',
        testUser,
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'featureArchivedZ',
            description: 'terrible feature',
        },
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.archiveToggle(
        'featureArchivedZ',
        testUser,
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'feature.with.variants',
            description: 'A feature flag with variants',
        },
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.saveVariants(
        'feature.with.variants',
        'default',
        [
            {
                name: 'control',
                weight: 50,
                weightType: 'fix',
                stickiness: 'default',
            },
            {
                name: 'new',
                weight: 50,
                weightType: 'variable',
                stickiness: 'default',
            },
        ],
        TEST_AUDIT_USER,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns four feature flags', async () => {
    return app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(4);
        });
});

test('returns dependencies', async () => {
    return app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features[0]).toMatchObject({
                name: 'featureY',
                dependencies: [
                    {
                        feature: 'featureX',
                        enabled: true,
                        variants: ['featureXVariant'],
                    },
                ],
            });
            expect(res.body.features[1].dependencies).toBe(undefined);
        });
});

test('returns four feature flags without createdAt', async () => {
    return app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(4);
            expect(res.body.features[0].createdAt).toBeFalsy();
        });
});

test('gets a feature by name', async () => {
    return app.request
        .get('/api/client/features/featureX')
        .expect('Content-Type', /json/)
        .expect(200);
});

test('returns a feature flags impression data', async () => {
    return app.request
        .get('/api/client/features/featureX')
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.impressionData).toBe(true);
        });
});

test('returns a false for impression data when not specified', async () => {
    return app.request
        .get('/api/client/features/featureZ')
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.impressionData).toBe(false);
        });
});

test('cant get feature that does not exist', async () => {
    return app.request
        .get('/api/client/features/myfeature')
        .expect('Content-Type', /json/)
        .expect(404);
});

test('Can filter features by namePrefix', async () => {
    return app.request
        .get('/api/client/features?namePrefix=feature.')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(1);
            expect(res.body.features[0].name).toBe('feature.with.variants');
        });
});

test('Can get strategies for specific environment', async () => {
    const featureName = 'test.feature.with.env';
    const env = DEFAULT_ENV;

    // Create feature flag
    await app.request.post('/api/admin/projects/default/features').send({
        name: featureName,
        type: 'kill-switch',
    });

    // Add global strategy
    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/${env}/strategies`,
        )
        .send({
            name: 'default',
        })
        .expect(200);

    // create new env

    await db.stores.environmentStore.create({
        name: 'testing',
        type: 'test',
    });

    await app.services.environmentService.addEnvironmentToProject(
        'testing',
        'default',
        SYSTEM_USER_AUDIT,
    );

    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/testing/strategies`,
        )
        .send({
            name: 'default',
        })
        .expect(200);

    await app.request
        .get(`/api/client/features/${featureName}?environment=testing`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.name).toBe(featureName);
            expect(res.body.strategies).toHaveLength(1);
            expect(
                res.body.strategies.find((s) => s.name === 'default'),
            ).toBeDefined();
        });
});

test('Can use multiple filters', async () => {
    expect.assertions(3);

    await app.request.post('/api/admin/projects/default/features').send({
        name: 'test.feature',
        type: 'kill-switch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await app.request.post('/api/admin/projects/default/features').send({
        name: 'test.feature2',
        type: 'kill-switch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await app.request.post('/api/admin/projects/default/features').send({
        name: 'notestprefix.feature3',
        type: 'release',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    const tag = { value: 'Crazy', type: 'simple' };
    const tag2 = { value: 'tagb', type: 'simple' };
    await app.request
        .post('/api/admin/features/test.feature/tags')
        .send(tag)
        .expect(201);
    await app.request
        .post('/api/admin/features/test.feature2/tags')
        .send(tag2)
        .expect(201);
    await app.request
        .post('/api/admin/features/notestprefix.feature3/tags')
        .send(tag)
        .expect(201);
    await app.request
        .get('/api/client/features?tag=simple:Crazy')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.features).toHaveLength(2));
    await app.request
        .get('/api/client/features?namePrefix=test&tag=simple:Crazy')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(1);
            expect(res.body.features[0].name).toBe('test.feature');
        });
});

test('returns a feature flags impression data for a different project', async () => {
    const project = {
        id: 'impression-data-client',
        name: 'ImpressionData',
        description: '',
        mode: 'open' as const,
    };

    await db.stores.projectStore.create(project);

    const flag = {
        name: 'project-client.impression.data',
        impressionData: true,
    };

    await app.request
        .post('/api/admin/projects/impression-data-client/features')
        .send(flag)
        .expect(201)
        .expect((res) => {
            expect(res.body.impressionData).toBe(true);
        });

    return app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect((res) => {
            const projectFlag = res.body.features.find(
                (resFlag) => resFlag.project === project.id,
            );

            expect(projectFlag.name).toBe(flag.name);
            expect(projectFlag.project).toBe(project.id);
            expect(projectFlag.impressionData).toBe(true);
        });
});

test('Can add tags while creating feature flag', async () => {
    const featureName = 'test.feature.with.tagss';
    const tags = [{ value: 'tag1', type: 'simple' }];

    await app.request.post('/api/admin/tags').send(tags[0]);

    await app.request.post('/api/admin/projects/default/features').send({
        name: featureName,
        type: 'kill-switch',
        tags,
    });

    const { body } = await app.request
        .get(`/api/admin/features/${featureName}/tags`)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        tags,
    });
});
