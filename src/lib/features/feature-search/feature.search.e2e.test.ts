import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    insertLastSeenAt,
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import type { FeatureSearchQueryParameters } from '../../openapi/spec/feature-search-query-parameters';
import { DEFAULT_PROJECT, type IUnleashStores } from '../../types';
import { DEFAULT_ENV } from '../../util';

let app: IUnleashTest;
let db: ITestDb;
let stores: IUnleashStores;

beforeAll(async () => {
    db = await dbInit('feature_search', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    anonymiseEventLog: true,
                },
            },
        },
        db.rawDatabase,
    );
    stores = db.stores;

    await app.request
        .post(`/auth/demo/login`)
        .send({
            email: 'user@getunleash.io',
        })
        .expect(200);

    await stores.environmentStore.create({
        name: 'development',
        type: 'development',
    });

    await app.linkProjectToEnvironment('default', 'development');

    await stores.environmentStore.create({
        name: 'production',
        type: 'production',
    });

    await app.linkProjectToEnvironment('default', 'production');
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
    await db.stores.segmentStore.deleteAll();
});

const searchFeatures = async (
    { query = '', project = 'IS:default' }: FeatureSearchQueryParameters,
    expectedCode = 200,
) => {
    return app.request
        .get(`/api/admin/search/features?query=${query}&project=${project}`)
        .expect(expectedCode);
};

const sortFeatures = async (
    {
        sortBy = '',
        sortOrder = '',
        project = 'default',
        favoritesFirst = 'false',
    }: FeatureSearchQueryParameters,
    expectedCode = 200,
) => {
    return app.request
        .get(
            `/api/admin/search/features?sortBy=${sortBy}&sortOrder=${sortOrder}&project=IS:${project}&favoritesFirst=${favoritesFirst}`,
        )
        .expect(expectedCode);
};

const searchFeaturesWithOffset = async (
    {
        query = '',
        project = 'default',
        offset = '0',
        limit = '10',
    }: FeatureSearchQueryParameters,
    expectedCode = 200,
) => {
    return app.request
        .get(
            `/api/admin/search/features?query=${query}&project=IS:${project}&offset=${offset}&limit=${limit}`,
        )
        .expect(expectedCode);
};

const filterFeaturesByType = async (typeParams: string, expectedCode = 200) => {
    return app.request
        .get(`/api/admin/search/features?type=${typeParams}`)
        .expect(expectedCode);
};

const filterFeaturesByCreatedBy = async (
    createdByParams: string,
    expectedCode = 200,
) => {
    return app.request
        .get(`/api/admin/search/features?createdBy=${createdByParams}`)
        .expect(expectedCode);
};

const filterFeaturesByTag = async (tag: string, expectedCode = 200) => {
    return app.request
        .get(`/api/admin/search/features?tag=${tag}`)
        .expect(expectedCode);
};

const filterFeaturesBySegment = async (segment: string, expectedCode = 200) => {
    return app.request
        .get(`/api/admin/search/features?segment=${segment}`)
        .expect(expectedCode);
};

const filterFeaturesByState = async (state: string, expectedCode = 200) => {
    return app.request
        .get(`/api/admin/search/features?state=${state}`)
        .expect(expectedCode);
};

const filterFeaturesByOperators = async (
    state: string,
    tag: string,
    createdAt: string,
    expectedCode = 200,
) => {
    return app.request
        .get(
            `/api/admin/search/features?createdAt=${createdAt}&state=${state}&tag=${tag}`,
        )
        .expect(expectedCode);
};

const filterFeaturesByCreated = async (
    createdAt: string,
    expectedCode = 200,
) => {
    return app.request
        .get(`/api/admin/search/features?createdAt=${createdAt}`)
        .expect(expectedCode);
};

const filterFeaturesByEnvironmentStatus = async (
    environmentStatuses: string[],
    expectedCode = 200,
) => {
    const statuses = environmentStatuses
        .map((status) => `status[]=${status}`)
        .join('&');
    return app.request
        .get(`/api/admin/search/features?${statuses}`)
        .expect(expectedCode);
};

const searchFeaturesWithoutQueryParams = async (expectedCode = 200) => {
    return app.request.get(`/api/admin/search/features`).expect(expectedCode);
};

test('should search matching features by name', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');
    await app.createFeature('my_feat_c');

    const { body } = await searchFeatures({ query: 'feature' });

    expect(body).toMatchObject({
        features: [
            {
                name: 'my_feature_a',
                createdBy: {
                    id: 1,
                    name: '3957b71c0@unleash.run',
                    imageUrl:
                        'https://gravatar.com/avatar/3957b71c0a6d2528f03b423f432ed2efe855d263400f960248a1080493d9d68a?s=42&d=retro&r=g',
                },
            },
            {
                name: 'my_feature_b',
                createdBy: {
                    id: 1,
                    name: '3957b71c0@unleash.run',
                    imageUrl:
                        'https://gravatar.com/avatar/3957b71c0a6d2528f03b423f432ed2efe855d263400f960248a1080493d9d68a?s=42&d=retro&r=g',
                },
            },
        ],
        total: 2,
    });
});

test('should paginate with offset', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');
    await app.createFeature('my_feature_c');
    await app.createFeature('my_feature_d');

    const { body: firstPage, headers: firstHeaders } =
        await searchFeaturesWithOffset({
            query: 'feature',
            offset: '0',
            limit: '2',
        });

    expect(firstPage).toMatchObject({
        features: [{ name: 'my_feature_a' }, { name: 'my_feature_b' }],
        total: 4,
    });

    const { body: secondPage, headers: secondHeaders } =
        await searchFeaturesWithOffset({
            query: 'feature',
            offset: '2',
            limit: '2',
        });

    expect(secondPage).toMatchObject({
        features: [{ name: 'my_feature_c' }, { name: 'my_feature_d' }],
        total: 4,
    });
});

test('should filter features by type', async () => {
    await app.createFeature({
        name: 'my_feature_a',
        type: 'release',
    });
    await app.createFeature({
        name: 'my_feature_b',
        type: 'experiment',
    });

    const { body } = await filterFeaturesByType(
        'IS_ANY_OF:experiment,kill-switch',
    );

    expect(body).toMatchObject({
        features: [{ name: 'my_feature_b' }],
    });
});

test('should filter features by created by', async () => {
    await app.createFeature({
        name: 'my_feature_a',
        type: 'release',
    });
    await app.createFeature({
        name: 'my_feature_b',
        type: 'experiment',
    });

    const { body } = await filterFeaturesByCreatedBy('IS:1');

    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }, { name: 'my_feature_b' }],
    });

    const { body: emptyResults } = await filterFeaturesByCreatedBy('IS:2');

    expect(emptyResults).toMatchObject({
        features: [],
    });
});

test('should filter features by tag', async () => {
    await app.createFeature('my_feature_a');
    await app.addTag('my_feature_a', {
        type: 'simple',
        value: 'my_tag',
    });
    await app.createFeature('my_feature_b');
    await app.createFeature('my_feature_c');
    await app.addTag('my_feature_c', {
        type: 'simple',
        value: 'tag_c',
    });
    await app.createFeature('my_feature_d');
    await app.addTag('my_feature_d', {
        type: 'simple',
        value: 'tag_c',
    });
    await app.addTag('my_feature_d', {
        type: 'simple',
        value: 'my_tag',
    });

    const { body } = await filterFeaturesByTag('INCLUDE:simple:my_tag');

    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }, { name: 'my_feature_d' }],
    });

    const { body: notIncludeBody } = await filterFeaturesByTag(
        'DO_NOT_INCLUDE:simple:my_tag',
    );

    expect(notIncludeBody).toMatchObject({
        features: [{ name: 'my_feature_b' }, { name: 'my_feature_c' }],
    });

    const { body: includeAllOf } = await filterFeaturesByTag(
        'INCLUDE_ALL_OF:simple:my_tag, simple:tag_c',
    );

    expect(includeAllOf).toMatchObject({
        features: [{ name: 'my_feature_d' }],
    });

    const { body: includeAnyOf } = await filterFeaturesByTag(
        'INCLUDE_ANY_OF:simple:my_tag, simple:tag_c',
    );

    expect(includeAnyOf).toMatchObject({
        features: [
            { name: 'my_feature_a' },
            { name: 'my_feature_c' },
            { name: 'my_feature_d' },
        ],
    });

    const { body: excludeIfAnyOf } = await filterFeaturesByTag(
        'EXCLUDE_IF_ANY_OF:simple:my_tag, simple:tag_c',
    );

    expect(excludeIfAnyOf).toMatchObject({
        features: [{ name: 'my_feature_b' }],
    });

    const { body: excludeAll } = await filterFeaturesByTag(
        'EXCLUDE_ALL:simple:my_tag, simple:tag_c',
    );

    expect(excludeAll).toMatchObject({
        features: [
            { name: 'my_feature_a' },
            { name: 'my_feature_b' },
            { name: 'my_feature_c' },
        ],
    });

    await filterFeaturesByTag('EXCLUDE_ALL:simple', 400);
    await filterFeaturesByTag('EXCLUDE_ALL:simple,simple', 400);
    await filterFeaturesByTag('EXCLUDE_ALL:simple,simple:jest', 400);
});

test('should filter features by tag that has colon inside', async () => {
    await app.createFeature('my_feature_a');
    await app.addTag('my_feature_a', {
        type: 'simple',
        value: 'my_tag:colon',
    });

    const { body } = await filterFeaturesByTag('INCLUDE:simple:my_tag:colon');

    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });
});

test('should filter features by environment status', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');
    await app.enableFeature('my_feature_a', 'default');

    const { body } = await filterFeaturesByEnvironmentStatus([
        'default:enabled',
        'nonexistentEnv:disabled',
        'default:wrongStatus',
    ]);

    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });
});

test('should return all feature tags', async () => {
    await app.createFeature('my_feature_a');
    await app.addTag('my_feature_a', {
        type: 'simple',
        value: 'my_tag',
    });
    await app.addTag('my_feature_a', {
        type: 'simple',
        value: 'second_tag',
    });

    const { body } = await searchFeatures({});

    expect(body).toMatchObject({
        features: [
            {
                name: 'my_feature_a',
                tags: [
                    {
                        type: 'simple',
                        value: 'my_tag',
                    },
                    {
                        type: 'simple',
                        value: 'second_tag',
                    },
                ],
            },
        ],
    });
});

test('should return empty features', async () => {
    const { body } = await searchFeatures({ query: '' });
    expect(body).toMatchObject({ features: [] });
});

test('should not search features from another project', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');

    const { body } = await searchFeatures({
        query: '',
        project: 'IS:another_project',
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

test('should sort features', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_c');
    await app.createFeature('my_feature_b');
    await app.enableFeature('my_feature_c', 'default');
    await app.favoriteFeature('my_feature_b');

    await insertLastSeenAt('my_feature_c', db.rawDatabase, 'default');

    const { body: ascName } = await sortFeatures({
        sortBy: 'name',
        sortOrder: 'asc',
    });

    expect(ascName).toMatchObject({
        features: [
            { name: 'my_feature_a' },
            { name: 'my_feature_b' },
            { name: 'my_feature_c' },
        ],
        total: 3,
    });

    const { body: descName } = await sortFeatures({
        sortBy: 'name',
        sortOrder: 'desc',
    });

    expect(descName).toMatchObject({
        features: [
            { name: 'my_feature_c' },
            { name: 'my_feature_b' },
            { name: 'my_feature_a' },
        ],
        total: 3,
    });

    const { body: defaultCreatedAt } = await sortFeatures({
        sortBy: '',
        sortOrder: 'asc',
    });

    expect(defaultCreatedAt).toMatchObject({
        features: [
            { name: 'my_feature_a' },
            { name: 'my_feature_c' },
            { name: 'my_feature_b' },
        ],
        total: 3,
    });

    const { body: environmentAscSort } = await sortFeatures({
        sortBy: 'environment:default',
        sortOrder: 'asc',
    });

    expect(environmentAscSort).toMatchObject({
        features: [
            { name: 'my_feature_a' },
            { name: 'my_feature_b' },
            { name: 'my_feature_c' },
        ],
        total: 3,
    });

    const { body: environmentDescSort } = await sortFeatures({
        sortBy: 'environment:default',
        sortOrder: 'desc',
    });

    expect(environmentDescSort).toMatchObject({
        features: [
            { name: 'my_feature_c' },
            { name: 'my_feature_a' },
            { name: 'my_feature_b' },
        ],
        total: 3,
    });

    const { body: favoriteEnvironmentDescSort } = await sortFeatures({
        sortBy: 'environment:default',
        sortOrder: 'desc',
        favoritesFirst: 'true',
    });

    expect(favoriteEnvironmentDescSort).toMatchObject({
        features: [
            { name: 'my_feature_b' },
            { name: 'my_feature_c' },
            { name: 'my_feature_a' },
        ],
        total: 3,
    });

    const { body: lastSeenAscSort } = await sortFeatures({
        sortBy: 'lastSeenAt',
        sortOrder: 'asc',
    });

    expect(lastSeenAscSort).toMatchObject({
        features: [
            { name: 'my_feature_c' },
            { name: 'my_feature_a' },
            { name: 'my_feature_b' },
        ],
        total: 3,
    });
});

test('should sort features when feature names are numbers', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_c');
    await app.createFeature('my_feature_b');
    await app.createFeature('1234');
    await app.favoriteFeature('my_feature_b');

    const { body: favoriteSortByName } = await sortFeatures({
        sortBy: 'name',
        sortOrder: 'asc',
        favoritesFirst: 'true',
    });

    expect(favoriteSortByName).toMatchObject({
        features: [
            { name: 'my_feature_b' },
            { name: '1234' },
            { name: 'my_feature_a' },
            { name: 'my_feature_c' },
        ],
        total: 4,
    });
});

test('should paginate correctly when using tags', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');
    await app.createFeature('my_feature_c');
    await app.createFeature('my_feature_d');

    await app.addTag('my_feature_b', {
        type: 'simple',
        value: 'first_tag',
    });
    await app.addTag('my_feature_b', {
        type: 'simple',
        value: 'second_tag',
    });
    await app.addTag('my_feature_a', {
        type: 'simple',
        value: 'second_tag',
    });
    await app.addTag('my_feature_c', {
        type: 'simple',
        value: 'second_tag',
    });
    await app.addTag('my_feature_c', {
        type: 'simple',
        value: 'first_tag',
    });

    const { body: secondPage } = await searchFeaturesWithOffset({
        query: 'feature',
        offset: '2',
        limit: '2',
    });

    expect(secondPage).toMatchObject({
        features: [{ name: 'my_feature_c' }, { name: 'my_feature_d' }],
        total: 4,
    });
});

test('should not return duplicate entries when sorting by environments', async () => {
    await app.createFeature('my_feature_a');
    await app.createFeature('my_feature_b');
    await app.createFeature('my_feature_c');
    await app.enableFeature('my_feature_a', 'production');
    await app.enableFeature('my_feature_b', 'production');

    const { body } = await sortFeatures({
        sortBy: 'environment:production',
        sortOrder: 'desc',
    });

    expect(body).toMatchObject({
        features: [
            { name: 'my_feature_a' },
            { name: 'my_feature_b' },
            { name: 'my_feature_c' },
        ],
        total: 3,
    });

    const { body: ascendingBody } = await sortFeatures({
        sortBy: 'environment:production',
        sortOrder: 'asc',
    });

    expect(ascendingBody).toMatchObject({
        features: [
            { name: 'my_feature_c' },
            { name: 'my_feature_a' },
            { name: 'my_feature_b' },
        ],
        total: 3,
    });
});

test('should search features by description', async () => {
    const description = 'secretdescription';
    await app.createFeature('my_feature_a');
    await app.createFeature({
        name: 'my_feature_b',
        description,
    });

    const { body } = await searchFeatures({
        query: 'descr',
    });
    expect(body).toMatchObject({
        features: [
            {
                name: 'my_feature_b',
                description,
                project: DEFAULT_PROJECT,
            },
        ],
    });
});

test('should support multiple search values', async () => {
    const description = 'secretdescription';
    await app.createFeature('my_feature_a');
    await app.createFeature({
        name: 'my_feature_b',
        description,
    });
    await app.createFeature('my_feature_c');

    const { body } = await searchFeatures({
        query: 'descr,c',
    });
    expect(body).toMatchObject({
        features: [
            {
                name: 'my_feature_b',
                description,
            },
            { name: 'my_feature_c' },
        ],
    });

    const { body: emptyQuery } = await searchFeatures({
        query: ' , ',
    });
    expect(emptyQuery).toMatchObject({
        features: [
            { name: 'my_feature_a' },
            { name: 'my_feature_b' },
            { name: 'my_feature_c' },
        ],
    });
});

test('should search features by project with operators', async () => {
    await app.createFeature('my_feature_a');

    await db.stores.projectStore.create({
        name: 'project_b',
        description: '',
        id: 'project_b',
    });

    await db.stores.featureToggleStore.create('project_b', {
        name: 'my_feature_b',
        createdByUserId: 9999,
    });

    await db.stores.projectStore.create({
        name: 'project_c',
        description: '',
        id: 'project_c',
    });

    await db.stores.featureToggleStore.create('project_c', {
        name: 'my_feature_c',
        createdByUserId: 9999,
    });

    const { body } = await searchFeatures({
        project: 'IS:default',
    });
    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });

    const { body: isNotBody } = await searchFeatures({
        project: 'IS_NOT:default',
    });
    expect(isNotBody).toMatchObject({
        features: [{ name: 'my_feature_b' }, { name: 'my_feature_c' }],
    });

    const { body: isAnyOfBody } = await searchFeatures({
        project: 'IS_ANY_OF:default,project_c',
    });
    expect(isAnyOfBody).toMatchObject({
        features: [{ name: 'my_feature_a' }, { name: 'my_feature_c' }],
    });

    const { body: isNotAnyBody } = await searchFeatures({
        project: 'IS_NONE_OF:default,project_c',
    });
    expect(isNotAnyBody).toMatchObject({
        features: [{ name: 'my_feature_b' }],
    });
});

test('should return segments in payload with no duplicates/nulls', async () => {
    await app.createFeature('my_feature_a');
    const { body: mySegment } = await app.createSegment({
        name: 'my_segment_a',
        constraints: [],
    });
    await app.addStrategyToFeatureEnv(
        {
            name: 'default',
            segments: [mySegment.id],
        },
        DEFAULT_ENV,
        'my_feature_a',
    );
    await app.enableFeature('my_feature_a', 'development');

    const { body } = await searchFeatures({});

    expect(body).toMatchObject({
        features: [
            {
                name: 'my_feature_a',
                segments: [mySegment.name],
                environments: [
                    {
                        name: 'default',
                        hasStrategies: true,
                        hasEnabledStrategies: true,
                    },
                    {
                        name: 'development',
                        hasStrategies: true,
                        hasEnabledStrategies: true,
                    },
                    {
                        name: 'production',
                        hasStrategies: false,
                        hasEnabledStrategies: false,
                    },
                ],
            },
        ],
    });
});

test('should filter features by segment', async () => {
    await app.createFeature('my_feature_a');
    const { body: mySegmentA } = await app.createSegment({
        name: 'my_segment_a',
        constraints: [],
    });
    await app.addStrategyToFeatureEnv(
        {
            name: 'default',
            segments: [mySegmentA.id],
        },
        DEFAULT_ENV,
        'my_feature_a',
    );
    await app.createFeature('my_feature_b');
    await app.createFeature('my_feature_c');
    const { body: mySegmentC } = await app.createSegment({
        name: 'my_segment_c',
        constraints: [],
    });
    await app.addStrategyToFeatureEnv(
        {
            name: 'default',
            segments: [mySegmentC.id],
        },
        DEFAULT_ENV,
        'my_feature_c',
    );
    await app.createFeature('my_feature_d');
    await app.addStrategyToFeatureEnv(
        {
            name: 'default',
            segments: [mySegmentC.id],
        },
        DEFAULT_ENV,
        'my_feature_d',
    );
    await app.addStrategyToFeatureEnv(
        {
            name: 'default',
            segments: [mySegmentA.id],
        },
        DEFAULT_ENV,
        'my_feature_d',
    );

    const { body } = await filterFeaturesBySegment('INCLUDE:my_segment_a');

    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }, { name: 'my_feature_d' }],
    });

    const { body: notIncludeBody } = await filterFeaturesBySegment(
        'DO_NOT_INCLUDE:my_segment_a',
    );

    expect(notIncludeBody).toMatchObject({
        features: [{ name: 'my_feature_b' }, { name: 'my_feature_c' }],
    });

    const { body: includeAllOf } = await filterFeaturesBySegment(
        'INCLUDE_ALL_OF:my_segment_a, my_segment_c',
    );

    expect(includeAllOf).toMatchObject({
        features: [{ name: 'my_feature_d' }],
    });

    const { body: includeAnyOf } = await filterFeaturesBySegment(
        'INCLUDE_ANY_OF:my_segment_a, my_segment_c',
    );

    expect(includeAnyOf).toMatchObject({
        features: [
            { name: 'my_feature_a' },
            { name: 'my_feature_c' },
            { name: 'my_feature_d' },
        ],
    });

    const { body: excludeIfAnyOf } = await filterFeaturesBySegment(
        'EXCLUDE_IF_ANY_OF:my_segment_a, my_segment_c',
    );

    expect(excludeIfAnyOf).toMatchObject({
        features: [{ name: 'my_feature_b' }],
    });

    const { body: excludeAll } = await filterFeaturesBySegment(
        'EXCLUDE_ALL:my_segment_a, my_segment_c',
    );

    expect(excludeAll).toMatchObject({
        features: [
            { name: 'my_feature_a' },
            { name: 'my_feature_b' },
            { name: 'my_feature_c' },
        ],
    });
});

test('should search features by state with operators', async () => {
    await app.createFeature({
        name: 'my_feature_a',
        stale: false,
    });
    await app.createFeature({
        name: 'my_feature_b',
        stale: true,
    });
    await app.createFeature({
        name: 'my_feature_c',
        stale: true,
    });

    const { body } = await filterFeaturesByState('IS:active');
    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });

    const { body: isNotBody } = await filterFeaturesByState('IS_NOT:active');
    expect(isNotBody).toMatchObject({
        features: [{ name: 'my_feature_b' }, { name: 'my_feature_c' }],
    });

    const { body: isAnyOfBody } = await filterFeaturesByState(
        'IS_ANY_OF:active, stale',
    );
    expect(isAnyOfBody).toMatchObject({
        features: [
            { name: 'my_feature_a' },
            { name: 'my_feature_b' },
            { name: 'my_feature_c' },
        ],
    });

    const { body: isNotAnyBody } = await filterFeaturesByState(
        'IS_NONE_OF:active, stale',
    );
    expect(isNotAnyBody).toMatchObject({
        features: [],
    });
});

test('should search features by created date with operators', async () => {
    await app.createFeature({
        name: 'my_feature_a',
        createdAt: '2023-01-27T15:21:39.975Z',
    });
    await app.createFeature({
        name: 'my_feature_b',
        createdAt: '2023-01-29T15:21:39.975Z',
    });

    const { body } = await filterFeaturesByCreated('IS_BEFORE:2023-01-28');
    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });

    const { body: afterBody } = await filterFeaturesByCreated(
        'IS_ON_OR_AFTER:2023-01-28',
    );
    expect(afterBody).toMatchObject({
        features: [{ name: 'my_feature_b' }],
    });
});

test('should filter features by combined operators', async () => {
    await app.createFeature({
        name: 'my_feature_a',
        createdAt: '2023-01-27T15:21:39.975Z',
        stale: true,
    });
    await app.createFeature({
        name: 'my_feature_b',
        createdAt: '2023-01-29T15:21:39.975Z',
    });

    await app.addTag('my_feature_b', {
        type: 'simple',
        value: 'my_tag',
    });

    const { body } = await filterFeaturesByOperators(
        'IS_NOT:active',
        'DO_NOT_INCLUDE:simple:my_tag',
        'IS_BEFORE:2023-01-28',
    );
    expect(body).toMatchObject({
        features: [{ name: 'my_feature_a' }],
    });
});

test('should return environment usage metrics and lifecycle', async () => {
    await app.createFeature({
        name: 'my_feature_b',
        createdAt: '2023-01-29T15:21:39.975Z',
    });

    await stores.clientMetricsStoreV2.batchInsertMetrics([
        {
            featureName: `my_feature_b`,
            appName: `web`,
            environment: 'development',
            timestamp: new Date(),
            yes: 5,
            no: 2,
        },
        {
            featureName: `my_feature_b`,
            appName: `web2`,
            environment: 'development',
            timestamp: new Date(),
            yes: 5,
            no: 2,
        },
        {
            featureName: `my_feature_b`,
            appName: `web`,
            environment: 'production',
            timestamp: new Date(),
            yes: 2,
            no: 2,
        },
    ]);

    await stores.featureLifecycleStore.insert([
        { feature: 'my_feature_b', stage: 'initial' },
    ]);
    await stores.featureLifecycleStore.insert([
        { feature: 'my_feature_b', stage: 'completed', status: 'discarded' },
    ]);

    const { body } = await searchFeatures({
        query: 'my_feature_b',
    });
    expect(body).toMatchObject({
        features: [
            {
                name: 'my_feature_b',
                lifecycle: { stage: 'completed', status: 'discarded' },
                environments: [
                    {
                        name: 'default',
                        yes: 0,
                        no: 0,
                    },
                    {
                        name: 'development',
                        yes: 10,
                        no: 4,
                    },
                    {
                        name: 'production',
                        yes: 2,
                        no: 2,
                    },
                ],
            },
        ],
    });
});

test('should return dependencyType', async () => {
    await app.createFeature({
        name: 'my_feature_a',
        createdAt: '2023-01-29T15:21:39.975Z',
    });
    await app.createFeature({
        name: 'my_feature_b',
        createdAt: '2023-01-29T15:21:39.975Z',
    });
    await app.createFeature({
        name: 'my_feature_c',
        createdAt: '2023-01-29T15:21:39.975Z',
    });
    await app.createFeature({
        name: 'my_feature_d',
        createdAt: '2023-01-29T15:21:39.975Z',
    });

    await stores.dependentFeaturesStore.upsert({
        child: 'my_feature_b',
        parent: 'my_feature_a',
        enabled: true,
    });
    await stores.dependentFeaturesStore.upsert({
        child: 'my_feature_c',
        parent: 'my_feature_a',
        enabled: true,
    });

    const { body } = await searchFeatures({
        query: 'my_feature',
    });
    expect(body).toMatchObject({
        features: [
            {
                name: 'my_feature_a',
                dependencyType: 'parent',
            },
            {
                name: 'my_feature_b',
                dependencyType: 'child',
            },
            {
                name: 'my_feature_c',
                dependencyType: 'child',
            },
            {
                name: 'my_feature_d',
                dependencyType: null,
            },
        ],
    });
});
