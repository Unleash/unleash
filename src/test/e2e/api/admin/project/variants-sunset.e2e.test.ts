import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../helpers/test-helper';
import dbInit, { type ITestDb } from '../../../helpers/database-init';
import getLogger from '../../../../fixtures/no-logger';
import { WeightType } from '../../../../../lib/types/model';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('project_feature_variants_api_sunset', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
                enableLegacyVariants: false,
            },
        },
    });
    await db.stores.environmentStore.create({
        name: 'development',
        type: 'development',
    });
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
    await db.stores.featureToggleStore.saveVariants('default', featureName, [
        {
            name: 'existing-variant',
            stickiness: 'default',
            weight: 1000,
            weightType: WeightType.VARIABLE,
        },
    ]);

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
