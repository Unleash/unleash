import { IUnleashTest, setupApp } from '../../../helpers/test-helper';
import dbInit, { ITestDb } from '../../../helpers/database-init';
import getLogger from '../../../../fixtures/no-logger';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('project_feature_variants_api_serial', getLogger);
    app = await setupApp(db.stores);
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
        variants: [
            {
                name: variantName,
                stickiness: 'default',
                weight: 100,
                weightType: 'variable',
            },
        ],
    });
    await app.request
        .get(`/api/admin/projects/default/features/${featureName}/variants`)
        .expect(200)
        .expect((res) => {
            expect(res.body.version).toBe('1');
            expect(res.body.variants).toHaveLength(1);
            expect(res.body.variants[0].name).toBe(variantName);
        });
});
