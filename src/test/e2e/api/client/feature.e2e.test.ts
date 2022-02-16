import { IUnleashTest, setupApp } from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { DEFAULT_ENV } from '../../../../lib/util/constants';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('feature_api_client', getLogger);
    app = await setupApp(db.stores);
    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        {
            name: 'featureX',
            description: 'the #1 feature',
            impressionData: true,
        },
        'test',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        {
            name: 'featureY',
            description: 'soon to be the #1 feature',
        },
        'test',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        {
            name: 'featureZ',
            description: 'terrible feature',
        },
        'test',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        {
            name: 'featureArchivedX',
            description: 'the #1 feature',
        },
        'test',
    );

    await app.services.featureToggleServiceV2.archiveToggle(
        'featureArchivedX',
        'test',
    );

    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        {
            name: 'featureArchivedY',
            description: 'soon to be the #1 feature',
        },
        'test',
    );

    await app.services.featureToggleServiceV2.archiveToggle(
        'featureArchivedY',
        'test',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        {
            name: 'featureArchivedZ',
            description: 'terrible feature',
        },
        'test',
    );
    await app.services.featureToggleServiceV2.archiveToggle(
        'featureArchivedZ',
        'test',
    );
    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        {
            name: 'feature.with.variants',
            description: 'A feature toggle with variants',
        },
        'test',
    );
    await app.services.featureToggleServiceV2.saveVariants(
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
        'ivar',
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns four feature toggles', async () => {
    return app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(4);
        });
});

test('returns four feature toggles without createdAt', async () => {
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

test('returns a feature toggles impression data', async () => {
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

    // Create feature toggle
    await app.request.post('/api/admin/projects/default/features').send({
        name: featureName,
        type: 'killswitch',
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
    );

    await app.request
        .post(
            `/api/admin/projects/default/features/${featureName}/environments/testing/strategies`,
        )
        .send({
            name: 'custom1',
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
                res.body.strategies.find((s) => s.name === 'custom1'),
            ).toBeDefined();
        });
});

test('Can use multiple filters', async () => {
    expect.assertions(3);

    await app.request.post('/api/admin/features').send({
        name: 'test.feature',
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await app.request.post('/api/admin/features').send({
        name: 'test.feature2',
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await app.request.post('/api/admin/features').send({
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

test('returns a feature toggles impression data for a different project', async () => {
    const project = {
        id: 'impression-data-client',
        name: 'ImpressionData',
        description: '',
    };

    await db.stores.projectStore.create(project);

    const toggle = {
        name: 'project-client.impression.data',
        impressionData: true,
    };

    await app.request
        .post('/api/admin/projects/impression-data-client/features')
        .send(toggle)
        .expect(201)
        .expect((res) => {
            expect(res.body.impressionData).toBe(true);
        });

    return app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect((res) => {
            const projectToggle = res.body.features.find(
                (resToggle) => resToggle.project === project.id,
            );

            expect(projectToggle.name).toBe(toggle.name);
            expect(projectToggle.project).toBe(project.id);
            expect(projectToggle.impressionData).toBe(true);
        });
});
