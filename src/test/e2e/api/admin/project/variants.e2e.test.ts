import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../../helpers/database-init.js';
import getLogger from '../../../../fixtures/no-logger.js';
import * as jsonpatch from 'fast-json-patch/index.mjs';
import { type IVariant, WeightType } from '../../../../../lib/types/model.js';
import { DEFAULT_ENV } from '../../../../../lib/server-impl.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('project_feature_variants_api_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    enableLegacyVariants: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('Can get variants for a feature', async () => {
    const featureName = 'feature-variants';
    const variantName = 'fancy-variant';
    await db.stores.featureToggleStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
    await db.stores.featureEnvironmentStore.addEnvironmentToFeature(
        featureName,
        DEFAULT_ENV,
        true,
    );
    await db.stores.featureEnvironmentStore.addVariantsToFeatureEnvironment(
        featureName,
        DEFAULT_ENV,
        [
            {
                name: variantName,
                stickiness: 'default',
                weight: 1000,
                weightType: WeightType.VARIABLE,
            },
        ],
    );
    await app.request
        .get(
            `/api/admin/projects/default/features/${featureName}/environments/${DEFAULT_ENV}/variants`,
        )
        .expect(200)
        .expect((res) => {
            expect(res.body.version).toBe(1);
            expect(res.body.variants).toHaveLength(1);
            expect(res.body.variants[0].name).toBe(variantName);
        });
});

test('Cannot get variants for a feature through a different project path', async () => {
    const featureName = 'feature-variants-cross-project';
    await db.stores.featureToggleStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
    await db.stores.featureEnvironmentStore.addEnvironmentToFeature(
        featureName,
        DEFAULT_ENV,
        true,
    );
    await db.stores.featureEnvironmentStore.addVariantsToFeatureEnvironment(
        featureName,
        DEFAULT_ENV,
        [
            {
                name: 'variant-hidden-by-project-scope',
                stickiness: 'default',
                weight: 1000,
                weightType: WeightType.VARIABLE,
            },
        ],
    );

    await app.request
        .get(
            `/api/admin/projects/not-default/features/${featureName}/environments/${DEFAULT_ENV}/variants`,
        )
        .expect(404);
});

test('Trying to do operations on a non-existing feature yields 404', async () => {
    await app.request
        .get(
            '/api/admin/projects/default/features/non-existing-feature/variants',
        )
        .expect(404);
    const variants = [
        {
            name: 'variant-put-overwrites',
            stickiness: 'default',
            weight: 1000,
            weightType: WeightType.VARIABLE,
        },
    ];
    await app.request
        .put(
            '/api/admin/projects/default/features/non-existing-feature/variants',
        )
        .send(variants)
        .expect(404);

    const newVariants: IVariant[] = [];
    const observer = jsonpatch.observe(newVariants);
    newVariants.push({
        name: 'variant1',
        stickiness: 'default',
        weight: 700,
        weightType: WeightType.VARIABLE,
    });
    const patch = jsonpatch.generate(observer);
    await app.request
        .patch(
            '/api/admin/projects/default/features/non-existing-feature/variants',
        )
        .send(patch)
        .expect(404);
});

test('Can push variants to multiple environments', async () => {
    const featureName = 'feature-to-override';
    const variant = (name: string, weight: number) => ({
        name,
        stickiness: 'default',
        weight,
        weightType: WeightType.VARIABLE,
    });
    await db.stores.featureToggleStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
    await db.stores.featureEnvironmentStore.addEnvironmentToFeature(
        featureName,
        'development',
        true,
    );
    await db.stores.featureEnvironmentStore.addEnvironmentToFeature(
        featureName,
        'production',
        true,
    );
    await db.stores.featureEnvironmentStore.addVariantsToFeatureEnvironment(
        featureName,
        'development',
        [
            variant('dev-variant-1', 250),
            variant('dev-variant-2', 250),
            variant('dev-variant-3', 250),
            variant('dev-variant-4', 250),
        ],
    );
    await db.stores.featureEnvironmentStore.addVariantsToFeatureEnvironment(
        featureName,
        'production',
        [variant('prod-variant', 1000)],
    );

    const overrideWith = {
        variants: [
            variant('new-variant-1', 500),
            variant('new-variant-2', 500),
        ],
        environments: ['development', 'production'],
    };

    await app.request
        .put(
            `/api/admin/projects/default/features/${featureName}/variants-batch`,
        )
        .send(overrideWith)
        .expect(200)
        .expect((res) => {
            expect(res.body.version).toBe(1);
            expect(res.body.variants).toHaveLength(2);
            expect(res.body.variants[0].name).toBe('new-variant-1');
            expect(res.body.variants[1].name).toBe('new-variant-2');
        });

    await app.request
        .get(
            `/api/admin/projects/default/features/${featureName}?variantEnvironments=true`,
        )
        .expect((res) => {
            const environments = res.body.environments;
            expect(environments).toHaveLength(2);
            const developmentVariants = environments.find(
                (x) => x.name === 'development',
            ).variants;
            const productionVariants = environments.find(
                (x) => x.name === 'production',
            ).variants;
            expect(developmentVariants).toHaveLength(2);
            expect(productionVariants).toHaveLength(2);
            expect(developmentVariants[0].name).toBe('new-variant-1');
            expect(developmentVariants[1].name).toBe('new-variant-2');
        });
});

test("Returns proper error if project and/or feature flag doesn't exist", async () => {
    await app.request
        .put(
            `/api/admin/projects/nonexistent/features/undefined/variants-batch`,
        )
        .send({
            variants: [
                {
                    name: 'new-variant-1',
                    stickiness: 'default',
                    weight: 500,
                    weightType: WeightType.VARIABLE,
                },
            ],
            environments: ['development', 'production'],
        })
        .expect(404);
});
