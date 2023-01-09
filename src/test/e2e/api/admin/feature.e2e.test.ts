import dbInit, { ITestDb } from '../../helpers/database-init';
import {
    IUnleashTest,
    setupApp,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';
import { DEFAULT_ENV } from '../../../../lib/util/constants';
import {
    FeatureToggleDTO,
    IStrategyConfig,
    IVariant,
} from '../../../../lib/types/model';
import { randomId } from '../../../../lib/util/random-id';

let app: IUnleashTest;
let db: ITestDb;

const defaultStrategy = {
    name: 'default',
    parameters: {},
    constraints: [],
};

beforeAll(async () => {
    db = await dbInit('feature_api_serial', getLogger);
    app = await setupApp(db.stores);

    const createToggle = async (
        toggle: FeatureToggleDTO,
        strategy: Omit<IStrategyConfig, 'id'> = defaultStrategy,
        projectId: string = 'default',
        username: string = 'test',
    ) => {
        await app.services.featureToggleServiceV2.createFeatureToggle(
            projectId,
            toggle,
            username,
        );
        await app.services.featureToggleServiceV2.createStrategy(
            strategy,
            { projectId, featureName: toggle.name, environment: DEFAULT_ENV },
            username,
        );
    };
    const createVariants = async (
        featureName: string,
        variants: IVariant[],
        projectId: string = 'default',
        username: string = 'test',
    ) => {
        await app.services.featureToggleServiceV2.saveVariants(
            featureName,
            projectId,
            variants,
            username,
        );
    };

    await createToggle({
        name: 'featureX',
        description: 'the #1 feature',
    });

    await createToggle(
        {
            name: 'featureY',
            description: 'soon to be the #1 feature',
        },
        {
            name: 'baz',
            constraints: [],
            parameters: {
                foo: 'bar',
            },
        },
    );

    await createToggle(
        {
            name: 'featureZ',
            description: 'terrible feature',
        },
        {
            name: 'baz',
            constraints: [],
            parameters: {
                foo: 'rab',
            },
        },
    );

    await createToggle(
        {
            name: 'featureArchivedX',
            description: 'the #1 feature',
        },
        {
            name: 'default',
            constraints: [],
            parameters: {},
        },
    );

    await app.services.featureToggleServiceV2.archiveToggle(
        'featureArchivedX',
        'test',
    );

    await createToggle(
        {
            name: 'featureArchivedY',
            description: 'soon to be the #1 feature',
        },
        {
            name: 'baz',
            constraints: [],
            parameters: {
                foo: 'bar',
            },
        },
    );

    await app.services.featureToggleServiceV2.archiveToggle(
        'featureArchivedY',
        'test',
    );

    await createToggle(
        {
            name: 'featureArchivedZ',
            description: 'terrible feature',
        },
        {
            name: 'baz',
            parameters: {
                foo: 'rab',
            },
            constraints: [],
        },
    );

    await app.services.featureToggleServiceV2.archiveToggle(
        'featureArchivedZ',
        'test',
    );

    await createToggle({
        name: 'feature.with.variants',
        description: 'A feature toggle with variants',
    });
    await createVariants('feature.with.variants', [
        {
            name: 'control',
            weight: 50,
            weightType: 'variable',
            overrides: [],
            stickiness: 'default',
        },
        {
            name: 'new',
            weight: 50,
            weightType: 'variable',
            overrides: [],
            stickiness: 'default',
        },
    ]);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns list of feature toggles', async () =>
    app.request
        .get('/api/admin/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(4);
        }));

test('gets a feature by name', async () => {
    expect.assertions(0);
    return app.request
        .get('/api/admin/features/featureX')
        .expect('Content-Type', /json/)
        .expect(200);
});

test('cant get feature that does not exist', async () => {
    expect.assertions(0);
    return app.request.get('/api/admin/features/myfeature').expect(404);
});

test('creates new feature toggle', async () => {
    expect.assertions(2);
    return app.request
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
});

test('creates new feature toggle with variants', async () => {
    expect.assertions(1);
    return app.request
        .post('/api/admin/features')
        .send({
            name: 'com.test.variants',
            enabled: false,
            strategies: [{ name: 'default' }],
            variants: [
                { name: 'variant1', weight: 50 },
                { name: 'variant2', weight: 50 },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.variants).toHaveLength(2);
        });
});

test('fetch feature toggle with variants', async () => {
    expect.assertions(1);
    return app.request
        .get('/api/admin/features/feature.with.variants')
        .expect(200)
        .expect((res) => {
            expect(res.body.variants).toHaveLength(2);
        });
});

test('creates new feature toggle with createdBy unknown', async () => {
    expect.assertions(1);
    await app.request
        .post('/api/admin/features')
        .send({
            name: 'com.test.Username',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .expect(201);
    await app.request.get('/api/admin/events').expect((res) => {
        expect(res.body.events[0].createdBy).toBe('unknown');
    });
});

test('create new feature toggle with variant type json', async () => {
    return app.request
        .post('/api/admin/features')
        .send({
            name: 'com.test.featureWithJson',
            variants: [
                {
                    name: 'variantTestJson',
                    weight: 1,
                    payload: {
                        type: 'json',
                        value: '{"test": true, "user": [{"jsonValid": 1}]}',
                    },
                    weightType: 'variable',
                },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('create new feature toggle with variant type string', async () => {
    return app.request
        .post('/api/admin/features')
        .send({
            name: 'com.test.featureWithString',
            variants: [
                {
                    name: 'variantTestString',
                    weight: 1,
                    payload: {
                        type: 'string',
                        value: 'my string # here',
                    },
                    weightType: 'variable',
                },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('refuses to create a new feature toggle with variant when type is json but value provided is not a valid json', async () => {
    return app.request
        .post('/api/admin/features')
        .send({
            name: 'com.test.featureInvalidValue',
            variants: [
                {
                    name: 'variantTest',
                    weight: 1,
                    payload: {
                        type: 'json',
                        value: 'this should be a # valid json', // <--- testing value
                    },
                    weightType: 'variable',
                },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect((res) => {
            expect(res.body.isJoi).toBe(true);
            expect(res.body.details[0].type).toBe('invalidJsonString');
            expect(res.body.details[0].message).toBe(
                `'value' must be a valid json string when 'type' is json`,
            );
        });
});

test('require new feature toggle to have a name', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/features')
        .send({ name: '' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should return 400 on invalid JSON data', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/features')
        .send(`{ invalid-json }`)
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('can not change status of feature toggle that does not exist', async () => {
    expect.assertions(0);
    return app.request
        .put('/api/admin/features/should-not-exist')
        .send({ name: 'should-not-exist', enabled: false })
        .set('Content-Type', 'application/json')
        .expect(404);
});

test('can change status of feature toggle that does exist', async () => {
    expect.assertions(0);
    return app.request
        .put('/api/admin/features/featureY')
        .send({
            name: 'featureY',
            enabled: true,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('cannot change project for feature toggle', async () => {
    await app.request
        .put('/api/admin/features/featureY')
        .send({
            name: 'featureY',
            enabled: true,
            project: 'random', //will be ignored
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(200);
    const { body } = await app.request
        .get('/api/admin/features/featureY')
        .expect(200);

    expect(body.project).toBe('default');
});

test('can not toggle of feature that does not exist', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/features/should-not-exist/toggle')
        .set('Content-Type', 'application/json')
        .expect(404);
});

test('can toggle a feature that does exist', async () => {
    expect.assertions(0);
    const featureName = 'existing.feature';
    const username = 'toggle-feature';
    const feature =
        await app.services.featureToggleServiceV2.createFeatureToggle(
            'default',
            {
                name: featureName,
            },
            'test',
        );
    await app.services.featureToggleServiceV2.createStrategy(
        defaultStrategy,
        { projectId: 'default', featureName, environment: DEFAULT_ENV },
        username,
    );
    return app.request
        .post(`/api/admin/features/${feature.name}/toggle`)
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('archives a feature by name', async () => {
    expect.assertions(0);
    return app.request.delete('/api/admin/features/featureX').expect(200);
});

test('can not archive unknown feature', async () => {
    expect.assertions(0);
    return app.request.delete('/api/admin/features/featureUnknown').expect(404);
});

test('refuses to create a feature with an existing name', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/features')
        .send({ name: 'featureX' })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test('refuses to validate a feature with an existing name', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/features/validate')
        .send({ name: 'featureX' })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test('new strategies api can add two strategies to a feature toggle', async () => {
    expect.assertions(0);
    return app.request
        .put('/api/admin/features/featureY')
        .send({
            name: 'featureY',
            description: 'soon to be the #14 feature',
            enabled: false,
            strategies: [
                {
                    name: 'baz',
                    parameters: { foo: 'bar' },
                },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('should not be possible to create archived toggle', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/features')
        .send({
            name: 'featureArchivedX',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test('creates new feature toggle with variant overrides', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/features')
        .send({
            name: 'com.test.variants.overrieds',
            enabled: false,
            strategies: [{ name: 'default' }],
            variants: [
                {
                    name: 'variant1',
                    weight: 50,
                    overrides: [
                        {
                            contextName: 'userId',
                            values: ['123'],
                        },
                    ],
                },
                { name: 'variant2', weight: 50 },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('creates new feature toggle without type', async () => {
    expect.assertions(1);
    await app.request.post('/api/admin/features').send({
        name: 'com.test.noType',
        enabled: false,
        strategies: [{ name: 'default' }],
    });
    return app.request
        .get('/api/admin/features/com.test.noType')
        .expect((res) => {
            expect(res.body.type).toBe('release');
        });
});

test('creates new feature toggle with type', async () => {
    expect.assertions(1);
    await app.request.post('/api/admin/features').send({
        name: 'com.test.withType',
        type: 'killswitch',
        enabled: false,
        strategies: [{ name: 'default' }],
    });
    return app.request
        .get('/api/admin/features/com.test.withType')
        .expect(200)
        .expect((res) => {
            expect(res.body.type).toBe('killswitch');
        });
});

test('tags feature with new tag', async () => {
    expect.assertions(1);
    await app.request.post('/api/admin/features').send({
        name: 'test.feature',
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await app.request
        .post('/api/admin/features/test.feature/tags')
        .send({
            value: 'TeamGreen',
            type: 'simple',
        })
        .set('Content-Type', 'application/json');
    return app.request
        .get('/api/admin/features/test.feature/tags')
        .expect((res) => {
            expect(res.body.tags[0].value).toBe('TeamGreen');
        });
});

test('tagging a feature with an already existing tag should be a noop', async () => {
    expect.assertions(1);
    await app.request.post('/api/admin/features').send({
        name: 'test.feature',
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await app.request.post('/api/admin/features/test.feature/tags').send({
        value: 'TeamGreen',
        type: 'simple',
    });
    await app.request.post('/api/admin/features/test.feature/tags').send({
        value: 'TeamGreen',
        type: 'simple',
    });
    return app.request
        .get('/api/admin/features/test.feature/tags')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tags).toHaveLength(1);
        });
});

test('can untag feature', async () => {
    expect.assertions(1);
    const feature1Name = randomId();
    await app.request.post('/api/admin/features').send({
        name: feature1Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    const tag = {
        value: randomId(),
        type: 'simple',
    };
    await app.request
        .post(`/api/admin/features/${feature1Name}/tags`)
        .send(tag)
        .expect(201);
    await app.request
        .delete(
            `/api/admin/features/${feature1Name}/tags/${tag.type}/${tag.value}`,
        )
        .expect(200);
    return app.request
        .get(`/api/admin/features/${feature1Name}/tags`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tags).toHaveLength(0);
        });
});

test('Can get features tagged by tag', async () => {
    expect.assertions(2);
    const feature1Name = randomId();
    const feature2Name = randomId();
    await app.request.post('/api/admin/features').send({
        name: feature1Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await app.request.post('/api/admin/features').send({
        name: feature2Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    const tag = { value: randomId(), type: 'simple' };
    await app.request
        .post(`/api/admin/features/${feature1Name}/tags`)
        .send(tag)
        .expect(201);
    return app.request
        .get(`/api/admin/features?tag=${tag.type}:${tag.value}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(1);
            expect(res.body.features[0].name).toBe(feature1Name);
        });
});
test('Can query for multiple tags using OR', async () => {
    expect.assertions(3);
    const feature1Name = randomId();
    const feature2Name = randomId();
    await app.request.post('/api/admin/features').send({
        name: feature1Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await app.request.post('/api/admin/features').send({
        name: feature2Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    const tag = { value: randomId(), type: 'simple' };
    const tag2 = { value: randomId(), type: 'simple' };
    await app.request
        .post(`/api/admin/features/${feature1Name}/tags`)
        .send(tag)
        .expect(201);
    await app.request
        .post(`/api/admin/features/${feature2Name}/tags`)
        .send(tag2)
        .expect(201);
    return app.request
        .get(
            `/api/admin/features?tag[]=${tag.type}:${tag.value}&tag[]=${tag2.type}:${tag2.value}`,
        )
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(2);
            expect(res.body.features.some((f) => f.name === feature1Name)).toBe(
                true,
            );
            expect(res.body.features.some((f) => f.name === feature2Name)).toBe(
                true,
            );
        });
});
test('Querying with multiple filters ANDs the filters', async () => {
    const feature1Name = `test.${randomId()}`;
    const feature2Name = randomId();
    const feature3Name = `notestprefix.${randomId()}`;

    await app.request.post('/api/admin/features').send({
        name: feature1Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await app.request.post('/api/admin/features').send({
        name: feature2Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    await app.request.post('/api/admin/features').send({
        name: feature3Name,
        type: 'release',
        enabled: true,
        strategies: [{ name: 'default' }],
    });
    const tag = { value: randomId(), type: 'simple' };
    const tag2 = { value: randomId(), type: 'simple' };
    await app.request
        .post(`/api/admin/features/${feature1Name}/tags`)
        .send(tag)
        .expect(201);
    await app.request
        .post(`/api/admin/features/${feature2Name}/tags`)
        .send(tag2)
        .expect(201);
    await app.request
        .post(`/api/admin/features/${feature3Name}/tags`)
        .send(tag)
        .expect(201);
    await app.request
        .get(`/api/admin/features?tag=${tag.type}:${tag.value}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => expect(res.body.features).toHaveLength(2));
    await app.request
        .get(`/api/admin/features?namePrefix=test&tag=${tag.type}:${tag.value}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(1);
            expect(res.body.features[0].name).toBe(feature1Name);
        });
});

test('Tagging a feature with a tag it already has should return 409', async () => {
    const feature1Name = `test.${randomId()}`;
    await app.request.post('/api/admin/features').send({
        name: feature1Name,
        type: 'killswitch',
        enabled: true,
        strategies: [{ name: 'default' }],
    });

    const tag = { value: randomId(), type: 'simple' };
    await app.request
        .post(`/api/admin/features/${feature1Name}/tags`)
        .send(tag)
        .expect(201);
    return app.request
        .post(`/api/admin/features/${feature1Name}/tags`)
        .send(tag)
        .expect(409)
        .expect((res) => {
            expect(res.body.details[0].message).toBe(
                `${feature1Name} already has the tag: [${tag.type}:${tag.value}]`,
            );
        });
});

test('marks feature toggle as stale', async () => {
    expect.assertions(1);
    await app.request
        .post('/api/admin/features/featureZ/stale/on')
        .set('Content-Type', 'application/json');

    return app.request.get('/api/admin/features/featureZ').expect((res) => {
        expect(res.body.stale).toBe(true);
    });
});

test('should not hit endpoints if disable configuration is set', async () => {
    const appWithDisabledLegacyFeatures = await setupAppWithCustomConfig(
        db.stores,
        {
            disableLegacyFeaturesApi: true,
        },
    );

    await appWithDisabledLegacyFeatures.request
        .get('/api/admin/features/featureX')
        .expect('Content-Type', /json/)
        .expect(404);

    await appWithDisabledLegacyFeatures.request
        .post(`/api/admin/features/featureZ/stale/on`)
        .set('Content-Type', 'application/json')
        .expect(404);
});

test('should hit validate and tags endpoint if legacy api is disabled', async () => {
    const appWithDisabledLegacyFeatures = await setupAppWithCustomConfig(
        db.stores,
        {
            disableLegacyFeaturesApi: true,
        },
    );

    const feature = {
        name: 'test.feature.disabled.api',
        type: 'killswitch',
    };

    await appWithDisabledLegacyFeatures.request
        .post('/api/admin/projects/default/features')
        .send(feature);

    await appWithDisabledLegacyFeatures.request
        .post(`/api/admin/features/${feature.name}/tags`)
        .send({
            value: 'TeamGreen',
            type: 'simple',
        })
        .set('Content-Type', 'application/json');

    await appWithDisabledLegacyFeatures.request
        .get(`/api/admin/features/${feature.name}/tags`)
        .expect((res) => {
            expect(res.body.tags[0].value).toBe('TeamGreen');
        });

    await appWithDisabledLegacyFeatures.request
        .post('/api/admin/features/validate')
        .send({ name: 'validateThis' })
        .expect(200);
});

test('should have access to the get all features endpoint even if api is disabled', async () => {
    const appWithDisabledLegacyFeatures = await setupAppWithCustomConfig(
        db.stores,
        {
            disableLegacyFeaturesApi: true,
        },
    );

    await appWithDisabledLegacyFeatures.request
        .get('/api/admin/features')
        .expect(200);
});
