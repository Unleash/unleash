import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { CHANGE_REQUEST_CREATED } from '../../../../lib/events/index.js';
import { CLIENT, DEFAULT_ENV } from '../../../../lib/server-impl.js';
import { ApiTokenType } from '../../../../lib/types/model.js';

const validTokens = [
    {
        tokenName: `client-dev-token`,
        permissions: [CLIENT],
        projects: ['*'],
        environment: 'development',
        type: ApiTokenType.CLIENT,
        secret: '*:development.client',
    },
    {
        tokenName: `client-prod-token`,
        permissions: [CLIENT],
        projects: ['*'],
        environment: 'production',
        type: ApiTokenType.CLIENT,
        secret: '*:production.client',
    },
];
const devTokenSecret = validTokens[0].secret;
const prodTokenSecret = validTokens[1].secret;
async function setup({
    etagVariantName,
    enabled,
}: {
    etagVariantName: string;
    enabled: boolean;
}): Promise<{ app: IUnleashTest; db: ITestDb }> {
    const db = await dbInit(`ignored`, getLogger);

    // Create per-environment client tokens so we can request specific environment snapshots
    const app = await setupAppWithAuth(
        db.stores,
        {
            authentication: {
                enableApiToken: true,
                initApiTokens: validTokens,
            },
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    etagVariant: {
                        name: etagVariantName,
                        enabled,
                        feature_enabled: enabled,
                    },
                },
            },
        },
        db.rawDatabase,
    );

    return { app, db };
}

async function initialize({ app, db }: { app: IUnleashTest; db: ITestDb }) {
    const allEnvs = await app.services.environmentService.getAll();
    const nonDefaultEnv = allEnvs.find((env) => env.name !== DEFAULT_ENV)!.name;

    await app.createFeature('X');
    await app.createFeature('Y');
    await app.archiveFeature('Y');
    await app.createFeature('Z');
    await app.enableFeature('Z', DEFAULT_ENV);
    await app.enableFeature('Z', nonDefaultEnv);

    await app.services.eventService.storeEvent({
        type: CHANGE_REQUEST_CREATED,
        createdBy: 'some@example.com',
        createdByUserId: 123,
        ip: '127.0.0.1',
        featureName: `X`,
    });

    /**
     * This helps reason about the etag, which is formed by <query-hash>:<event-id>
     * To see the output you need to run this test with --silent=false
     * You can see the expected output in the expect statement below
     */
    const { events } = await app.services.eventService.getEvents();
    // NOTE: events could be processed in different order resulting in a flaky test
    const actualEvents = events
        .reverse()
        .map(({ id, environment, featureName, type }) => ({
            id,
            environment,
            featureName,
            type,
        }));
    const expectedEvents = [
        {
            id: 7,
            featureName: 'X',
            type: 'feature-created',
        },
        {
            id: 8,
            featureName: 'Y',
            type: 'feature-created',
        },
        {
            id: 9,
            featureName: 'Y',
            type: 'feature-archived',
        },
        {
            id: 10,
            featureName: 'Z',
            type: 'feature-created',
        },
        {
            id: 11,
            environment: 'development',
            featureName: 'Z',
            type: 'feature-strategy-add',
        },
        {
            id: 12,
            environment: 'development',
            featureName: 'Z',
            type: 'feature-environment-enabled',
        },
        {
            id: 13,
            environment: 'production',
            featureName: 'Z',
            type: 'feature-strategy-add',
        },
        {
            id: 14,
            environment: 'production',
            featureName: 'Z',
            type: 'feature-environment-enabled',
        },
        {
            id: 15,
            featureName: 'X',
            type: 'change-request-created',
        },
    ];
    // We only require that all expectedEvents exist within actualEvents, matching
    // only on the properties explicitly specified in each expected object.
    // This lets us omit properties (like id) from some expected entries that might
    // arrive in different order, without breaking the test.
    for (const expectedEvent of expectedEvents) {
        expect(actualEvents).toContainEqual(
            expect.objectContaining(expectedEvent),
        );
    }
}

describe.each([
    {
        name: 'disabled',
        enabled: false,
    },
    {
        name: 'v2',
        enabled: true,
    },
])('feature 304 api client (etag variant = $name)', ({ name, enabled }) => {
    let app: IUnleashTest;
    let db: ITestDb;
    beforeAll(async () => {
        ({ app, db } = await setup({
            etagVariantName: name,
            enabled,
        }));
        await initialize({ app, db });
    });

    afterAll(async () => {
        await app.destroy();
        await db.destroy();
    });

    test('returns calculated hash without if-none-match header (dev env token)', async () => {
        const res = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .expect('Content-Type', /json/)
            .expect(200);

        if (enabled) {
            expect(res.headers.etag).toBe(`"76d8bb0e:12:${name}"`);
            expect(res.body.meta.etag).toBe(`"76d8bb0e:12:${name}"`);
        } else {
            expect(res.headers.etag).toBe('"76d8bb0e:12"');
            expect(res.body.meta.etag).toBe('"76d8bb0e:12"');
        }
    });

    test(`returns ${enabled ? 200 : 304} for pre-calculated hash${enabled ? ' because hash changed' : ''} (dev env token)`, async () => {
        const res = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .set('if-none-match', '"76d8bb0e:12"')
            .expect(enabled ? 200 : 304);

        if (enabled) {
            expect(res.headers.etag).toBe(`"76d8bb0e:12:${name}"`);
            expect(res.body.meta.etag).toBe(`"76d8bb0e:12:${name}"`);
        }
    });

    test('creating a new feature does not modify etag', async () => {
        await app.createFeature('new');
        await app.services.configurationRevisionService.updateMaxRevisionId();

        await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .set('if-none-match', `"76d8bb0e:12${enabled ? `:${name}` : ''}"`)
            .expect(304);
    });

    test('production environment gets a different etag than development', async () => {
        const { headers: prodHeaders } = await app.request
            .get('/api/client/features?bla=1')
            .set('Authorization', prodTokenSecret)
            .expect(200);
        if (enabled) {
            expect(prodHeaders.etag).toEqual('"67e24428:14:v2"');
        } else {
            expect(prodHeaders.etag).toEqual('"67e24428:14"');
        }

        const { headers: devHeaders } = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .expect(200);
        if (enabled) {
            expect(devHeaders.etag).toEqual('"76d8bb0e:12:v2"');
        } else {
            expect(devHeaders.etag).toEqual('"76d8bb0e:12"');
        }
    });

    test('modifying dev environment should only invalidate dev tokens', async () => {
        const currentDevEtag = `"76d8bb0e:12${enabled ? `:${name}` : ''}"`;
        const currentProdEtag = `"67e24428:14${enabled ? `:${name}` : ''}"`;
        await app.request
            .get('/api/client/features')
            .set('if-none-match', currentProdEtag)
            .set('Authorization', prodTokenSecret)
            .expect(304);

        await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .set('if-none-match', currentDevEtag)
            .expect(304);

        await app.enableFeature('X', DEFAULT_ENV);
        await app.services.configurationRevisionService.updateMaxRevisionId();

        await app.request
            .get('/api/client/features')
            .set('Authorization', prodTokenSecret)
            .set('if-none-match', currentProdEtag)
            .expect(304);

        const { headers: devHeaders } = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .set('if-none-match', currentDevEtag)
            .expect(200);

        // Note: this test yields a different result if run in isolation
        // this is because the id 18 depends on a previous test adding a feature
        // otherwise the id will be 17
        expect(devHeaders.etag).toEqual(
            `"76d8bb0e:18${enabled ? `:${name}` : ''}"`,
        );
    });
});
