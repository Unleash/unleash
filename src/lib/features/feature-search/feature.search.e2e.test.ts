import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import { FeatureSearchQueryParameters } from '../../openapi/spec/feature-search-query-parameters';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('feature_search', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    featureSearchAPI: true,
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

const searchFeatures = async (
    { query, projectId = 'default' }: Partial<FeatureSearchQueryParameters>,
    expectedCode = 200,
) => {
    return app.request
        .get(`/api/admin/search/features?query=${query}&projectId=${projectId}`)
        .expect(expectedCode);
};

const searchFeaturesWithoutQueryParams = async (expectedCode = 200) => {
    return app.request.get(`/api/admin/search/features`).expect(expectedCode);
};

test('should return matching features by name', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');
    await app.createFeature('my_feat_c');

    const { body } = await searchFeatures({ query: 'feature' });

    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }, { name: 'my_feature_b' }],
    });
});

test('should return matching features by tag', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');
    await app.addTag('my_feature_a', { type: 'simple', value: 'my_tag' });

    const { body: fullMatch } = await searchFeatures({
        query: 'simple:my_tag',
    });
    const { body: tagTypeMatch } = await searchFeatures({ query: 'simple' });
    const { body: tagValueMatch } = await searchFeatures({ query: 'my_tag' });
    const { body: partialTagMatch } = await searchFeatures({ query: 'e:m' });

    expect(fullMatch).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });
    expect(tagTypeMatch).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });
    expect(tagValueMatch).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });
    expect(partialTagMatch).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });
});

test('should return empty features', async () => {
    const { body } = await searchFeatures({ query: '' });
    expect(body).toMatchObject({ features: [] });
});

test('should not return features from another project', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');

    const { body } = await searchFeatures({
        query: '',
        projectId: 'another_project',
    });

    expect(body).toMatchObject({ features: [] });
});

test('should return features without query', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');

    const { body } = await searchFeaturesWithoutQueryParams();

    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }, { name: 'my_feature_b' }],
    });
});
