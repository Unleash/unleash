import { IUnleashTest, setupApp } from '../../../helpers/test-helper';
import dbInit, { ITestDb } from '../../../helpers/database-init';
import getLogger from '../../../../fixtures/no-logger';
import * as jsonpatch from 'fast-json-patch';

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

test('Can patch variants for a feature and get a response of new variant', async () => {
    const featureName = 'feature-variants-patch';
    const variantName = 'fancy-variant-patch';
    const expectedVariantName = 'not-so-cool-variant-name';
    const variants = [
        {
            name: variantName,
            stickiness: 'default',
            weight: 100,
            weightType: 'variable',
        },
    ];

    await db.stores.featureToggleStore.create('default', {
        name: featureName,
        variants,
    });

    const observer = jsonpatch.observe(variants);
    variants[0].name = expectedVariantName;
    const patch = jsonpatch.generate(observer);

    await app.request
        .patch(`/api/admin/projects/default/features/${featureName}/variants`)
        .send(patch)
        .expect(200)
        .expect((res) => {
            expect(res.body.version).toBe('1');
            expect(res.body.variants).toHaveLength(1);
            expect(res.body.variants[0].name).toBe(expectedVariantName);
        });
});

test('Can add variant for a feature', async () => {
    const featureName = 'feature-variants-patch-add';
    const variantName = 'fancy-variant-patch';
    const expectedVariantName = 'not-so-cool-variant-name';
    const variants = [
        {
            name: variantName,
            stickiness: 'default',
            weight: 100,
            weightType: 'variable',
        },
    ];

    await db.stores.featureToggleStore.create('default', {
        name: featureName,
        variants,
    });

    const observer = jsonpatch.observe(variants);
    variants.push({
        name: expectedVariantName,
        stickiness: 'default',
        weight: 100,
        weightType: 'variable',
    });
    const patch = jsonpatch.generate(observer);

    await app.request
        .patch(`/api/admin/projects/default/features/${featureName}/variants`)
        .send(patch)
        .expect(200);

    await app.request
        .get(`/api/admin/projects/default/features/${featureName}/variants`)
        .expect((res) => {
            console.log(res.body);
            expect(res.body.version).toBe('1');
            expect(res.body.variants).toHaveLength(2);
            expect(
                res.body.variants.find((x) => x.name === expectedVariantName),
            ).toBeTruthy();
            expect(
                res.body.variants.find((x) => x.name === variantName),
            ).toBeTruthy();
        });
});

test('Can remove variant for a feature', async () => {
    const featureName = 'feature-variants-patch-remove';
    const variantName = 'fancy-variant-patch';
    const variants = [
        {
            name: variantName,
            stickiness: 'default',
            weight: 100,
            weightType: 'variable',
        },
    ];

    await db.stores.featureToggleStore.create('default', {
        name: featureName,
        variants,
    });

    const observer = jsonpatch.observe(variants);
    variants.pop();
    const patch = jsonpatch.generate(observer);

    await app.request
        .patch(`/api/admin/projects/default/features/${featureName}/variants`)
        .send(patch)
        .expect(200);

    await app.request
        .get(`/api/admin/projects/default/features/${featureName}/variants`)
        .expect((res) => {
            console.log(res.body);
            expect(res.body.version).toBe('1');
            expect(res.body.variants).toHaveLength(0);
        });
});
