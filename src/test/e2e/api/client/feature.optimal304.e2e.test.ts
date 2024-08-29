import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import dbInit, { type ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import type User from '../../../../lib/types/user';
import { TEST_AUDIT_USER } from '../../../../lib/types';
// import { DEFAULT_ENV } from '../../../../lib/util/constants';

let app: IUnleashTest;
let db: ITestDb;
const testUser = { name: 'test', id: -9999 } as User;

beforeAll(async () => {
    db = await dbInit('feature_304_api_client', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    optimal304: true,
                },
            },
        },
        db.rawDatabase,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'featureX',
            description: 'the #1 feature',
            impressionData: true,
        },
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'featureY',
            description: 'soon to be the #1 feature',
        },
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'featureZ',
            description: 'terrible feature',
        },
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'featureArchivedX',
            description: 'the #1 feature',
        },
        TEST_AUDIT_USER,
    );

    await app.services.featureToggleService.archiveToggle(
        'featureArchivedX',
        testUser,
        TEST_AUDIT_USER,
    );

    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'featureArchivedY',
            description: 'soon to be the #1 feature',
        },
        TEST_AUDIT_USER,
    );

    await app.services.featureToggleService.archiveToggle(
        'featureArchivedY',
        testUser,
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'featureArchivedZ',
            description: 'terrible feature',
        },
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.archiveToggle(
        'featureArchivedZ',
        testUser,
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'feature.with.variants',
            description: 'A feature flag with variants',
        },
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.saveVariants(
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
        TEST_AUDIT_USER,
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
    expect(res.headers.etag).toBe('"61824cd0:16"');
    expect(res.body.meta.etag).toBe('"61824cd0:16"');
});

test('returns 304 for pre-calculated hash', async () => {
    return app.request
        .get('/api/client/features')
        .set('if-none-match', '"61824cd0:16"')
        .expect(304);
});

test('returns 200 when content updates and hash does not match anymore', async () => {
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'featureNew304',
            description: 'the #1 feature',
        },
        TEST_AUDIT_USER,
    );
    await app.services.configurationRevisionService.updateMaxRevisionId();

    const res = await app.request
        .get('/api/client/features')
        .set('if-none-match', 'ae443048:16')
        .expect(200);

    expect(res.headers.etag).toBe('"61824cd0:17"');
    expect(res.body.meta.etag).toBe('"61824cd0:17"');
});
