import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
// import { DEFAULT_ENV } from '../../../../lib/util/constants';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('feature_304_api_client', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
                optimal304: true,
            },
        },
    });
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

test('returns calculated hash', async () => {
    const res = await app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(res.headers.etag).toBe('"ae443048:16"');
    expect(res.body.meta.etag).toBe('"ae443048:16"');
});

test('returns 304 for pre-calculated hash', async () => {
    return app.request
        .get('/api/client/features')
        .set('if-none-match', '"ae443048:16"')
        .expect(304);
});

test('returns 200 when content updates and hash does not match anymore', async () => {
    await app.services.featureToggleServiceV2.createFeatureToggle(
        'default',
        {
            name: 'featureNew304',
            description: 'the #1 feature',
        },
        'test',
    );
    await app.services.configurationRevisionService.updateMaxRevisionId();

    const res = await app.request
        .get('/api/client/features')
        .set('if-none-match', 'ae443048:16')
        .expect(200);

    expect(res.headers.etag).toBe('"ae443048:17"');
    expect(res.body.meta.etag).toBe('"ae443048:17"');
});
