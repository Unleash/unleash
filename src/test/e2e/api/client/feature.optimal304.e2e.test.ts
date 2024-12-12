import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import dbInit, { type ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import type User from '../../../../lib/types/user';
import { TEST_AUDIT_USER } from '../../../../lib/types';
// import { DEFAULT_ENV } from '../../../../lib/util/constants';

const testUser = { name: 'test', id: -9999 } as User;

const shutdownHooks: (() => Promise<void>)[] = [];

describe.each([
    {
        name: 'disabled',
        enabled: false,
        feature_enabled: false,
    },
    {
        name: 'v2',
        enabled: true,
        feature_enabled: true,
    },
])('feature 304 api client (etag variant = %s)', (etagVariant) => {
    let app: IUnleashTest;
    let db: ITestDb;
    const apendix = etagVariant.feature_enabled
        ? `${etagVariant.name}`
        : 'etag_variant_off';
    beforeAll(async () => {
        db = await dbInit(`feature_304_api_client_${apendix}`, getLogger);
        app = await setupAppWithCustomConfig(
            db.stores,
            {
                experimental: {
                    flags: {
                        strictSchemaValidation: true,
                        etagVariant: etagVariant,
                    },
                },
            },
            db.rawDatabase,
        );

        await app.services.featureToggleService.createFeatureToggle(
            'default',
            {
                name: `featureX${apendix}`,
                description: 'the #1 feature',
                impressionData: true,
            },
            TEST_AUDIT_USER,
        );
        await app.services.featureToggleService.createFeatureToggle(
            'default',
            {
                name: `featureY${apendix}`,
                description: 'soon to be the #1 feature',
            },
            TEST_AUDIT_USER,
        );
        await app.services.featureToggleService.createFeatureToggle(
            'default',
            {
                name: `featureZ${apendix}`,
                description: 'terrible feature',
            },
            TEST_AUDIT_USER,
        );
        await app.services.featureToggleService.createFeatureToggle(
            'default',
            {
                name: `featureArchivedX${apendix}`,
                description: 'the #1 feature',
            },
            TEST_AUDIT_USER,
        );

        await app.services.featureToggleService.archiveToggle(
            `featureArchivedX${apendix}`,
            testUser,
            TEST_AUDIT_USER,
        );

        await app.services.featureToggleService.createFeatureToggle(
            'default',
            {
                name: `featureArchivedY${apendix}`,
                description: 'soon to be the #1 feature',
            },
            TEST_AUDIT_USER,
        );

        await app.services.featureToggleService.archiveToggle(
            `featureArchivedY${apendix}`,
            testUser,
            TEST_AUDIT_USER,
        );
        await app.services.featureToggleService.createFeatureToggle(
            'default',
            {
                name: `featureArchivedZ${apendix}`,
                description: 'terrible feature',
            },
            TEST_AUDIT_USER,
        );
        await app.services.featureToggleService.archiveToggle(
            `featureArchivedZ${apendix}`,
            testUser,
            TEST_AUDIT_USER,
        );
        await app.services.featureToggleService.createFeatureToggle(
            'default',
            {
                name: `feature.with.variants${apendix}`,
                description: 'A feature flag with variants',
            },
            TEST_AUDIT_USER,
        );
        await app.services.featureToggleService.saveVariants(
            `feature.with.variants${apendix}`,
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

        shutdownHooks.push(async () => {
            await app.destroy();
            await db.destroy();
        });
    });

    test('returns calculated hash', async () => {
        const res = await app.request
            .get('/api/client/features')
            .expect('Content-Type', /json/)
            .expect(200);

        if (etagVariant.feature_enabled) {
            expect(res.headers.etag).toBe(`"61824cd0:17:${etagVariant.name}"`);
            expect(res.body.meta.etag).toBe(
                `"61824cd0:17:${etagVariant.name}"`,
            );
        } else {
            expect(res.headers.etag).toBe('"61824cd0:16"');
            expect(res.body.meta.etag).toBe('"61824cd0:16"');
        }
    });

    test(`returns ${etagVariant.feature_enabled ? 200 : 304} for pre-calculated hash${etagVariant.feature_enabled ? ' because hash changed' : ''}`, async () => {
        const res = await app.request
            .get('/api/client/features')
            .set('if-none-match', '"61824cd0:16"')
            .expect(etagVariant.feature_enabled ? 200 : 304);

        if (etagVariant.feature_enabled) {
            expect(res.headers.etag).toBe(`"61824cd0:17:${etagVariant.name}"`);
            expect(res.body.meta.etag).toBe(
                `"61824cd0:17:${etagVariant.name}"`,
            );
        }
    });

    test('returns 200 when content updates and hash does not match anymore', async () => {
        await app.services.featureToggleService.createFeatureToggle(
            'default',
            {
                name: `featureNew304${apendix}`,
                description: 'the #1 feature',
            },
            TEST_AUDIT_USER,
        );
        await app.services.configurationRevisionService.updateMaxRevisionId();

        const res = await app.request
            .get('/api/client/features')
            .set('if-none-match', 'ae443048:16')
            .expect(200);

        if (etagVariant.feature_enabled) {
            expect(res.headers.etag).toBe(`"61824cd0:17:${etagVariant.name}"`);
            expect(res.body.meta.etag).toBe(
                `"61824cd0:17:${etagVariant.name}"`,
            );
        } else {
            expect(res.headers.etag).toBe('"61824cd0:17"');
            expect(res.body.meta.etag).toBe('"61824cd0:17"');
        }
    });
});

// running after all inside describe block, causes some of the queries to fail to acquire a connection
// this workaround is to run the afterAll outside the describe block
afterAll(async () => {
    await Promise.all(shutdownHooks.map((hook) => hook()));
});
