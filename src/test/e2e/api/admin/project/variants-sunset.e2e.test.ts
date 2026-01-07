import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../../helpers/database-init.js';
import getLogger from '../../../../fixtures/no-logger.js';
import { WeightType } from '../../../../../lib/types/model.js';
import { DEFAULT_ENV } from '../../../../../lib/server-impl.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('project_feature_variants_api_sunset', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    enableLegacyVariants: false,
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

beforeEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
});

test('Cannot add environment variants to a new feature', async () => {
    const featureName = 'feature-variants-patch';

    await db.stores.featureToggleStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
    await db.stores.featureEnvironmentStore.addEnvironmentToFeature(
        featureName,
        'development',
        true,
    );

    const patch = [
        {
            op: 'add',
            path: '/0',
            value: {
                name: 'a',
                weightType: WeightType.VARIABLE,
                weight: 1000,
            },
        },
    ];

    await app.request
        .patch(
            `/api/admin/projects/default/features/${featureName}/environments/development/variants`,
        )
        .send(patch)
        .expect(403)
        .expect((res) => {
            expect(res.body.message).toBe(
                'Environment variants deprecated for feature: feature-variants-patch. Use strategy variants instead.',
            );
        });
});

test('Can add environment variants when existing ones exist for this feature', async () => {
    const featureName = 'feature-variants-patch';

    await db.stores.featureToggleStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
    await db.stores.featureEnvironmentStore.addEnvironmentToFeature(
        featureName,
        'development',
        true,
    );
    await db.stores.featureEnvironmentStore.addVariantsToFeatureEnvironment(
        featureName,
        DEFAULT_ENV,
        [
            {
                name: 'existing-variant',
                stickiness: 'default',
                weight: 1000,
                weightType: WeightType.VARIABLE,
            },
        ],
    );

    const patch = [
        {
            op: 'add',
            path: '/0',
            value: {
                name: 'a',
                weightType: WeightType.VARIABLE,
                weight: 1000,
            },
        },
    ];

    await app.request
        .patch(
            `/api/admin/projects/default/features/${featureName}/environments/development/variants`,
        )
        .send(patch)
        .expect(200);
});

test('Patching variants with an invalid patch payload should return a BadDataError', async () => {
    const featureName = 'feature-variants-patch';

    await db.stores.featureToggleStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
    await db.stores.featureEnvironmentStore.addEnvironmentToFeature(
        featureName,
        'development',
        true,
    );
    await db.stores.featureEnvironmentStore.addVariantsToFeatureEnvironment(
        featureName,
        'development',
        [
            {
                name: 'existing-variant',
                stickiness: 'default',
                weight: 1000,
                weightType: WeightType.VARIABLE,
            },
        ],
    );

    const patch = [
        {
            op: 'add',
            path: '/2/overrides', // Invalid path
            value: {
                name: 'a',
                weightType: WeightType.VARIABLE,
                weight: 1000,
            },
        },
    ];

    await app.request
        .patch(
            `/api/admin/projects/default/features/${featureName}/environments/development/variants`,
        )
        .send(patch)
        .expect(400)
        .expect((res) => {
            expect(res.body.name).toBe('BadDataError');
            expect(res.body.message).toBe(
                `Request validation failed: your request body or params contain invalid data: Could not apply provided patch: Cannot set properties of undefined (setting 'overrides')`,
            );
        });
});
