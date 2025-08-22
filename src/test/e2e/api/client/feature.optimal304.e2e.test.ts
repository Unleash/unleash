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
    {
        tokenName: 'all-envs-client',
        permissions: [CLIENT],
        projects: ['*'],
        environment: '*',
        type: ApiTokenType.CLIENT,
        secret: '*:*.hungry-client',
    },
];
const devTokenSecret = validTokens[0].secret;
const prodTokenSecret = validTokens[1].secret;
const allEnvsTokenSecret = validTokens[2].secret;

async function setup({
    etagVariant,
    etagByEnvEnabled,
}: {
    etagVariant: string | undefined;
    etagByEnvEnabled: boolean;
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
                        name: etagVariant,
                        enabled: etagVariant !== undefined,
                        feature_enabled: etagVariant !== undefined,
                    },
                    etagByEnv: etagByEnvEnabled,
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
}

async function validateInitialState({
    app,
    db,
}: { app: IUnleashTest; db: ITestDb }) {
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
    let nextId = 8; // this is the first id after the token creation events
    const expectedEvents = [
        {
            id: nextId++,
            featureName: 'X',
            type: 'feature-created',
        },
        {
            id: nextId++,
            featureName: 'Y',
            type: 'feature-created',
        },
        {
            id: nextId++,
            featureName: 'Y',
            type: 'feature-archived',
        },
        {
            id: nextId++,
            featureName: 'Z',
            type: 'feature-created',
        },
        {
            id: nextId++,
            environment: 'development',
            featureName: 'Z',
            type: 'feature-strategy-add',
        },
        {
            id: nextId++,
            environment: 'development',
            featureName: 'Z',
            type: 'feature-environment-enabled',
        },
        {
            id: nextId++,
            environment: 'production',
            featureName: 'Z',
            type: 'feature-strategy-add',
        },
        {
            id: nextId++,
            environment: 'production',
            featureName: 'Z',
            type: 'feature-environment-enabled',
        },
        {
            id: nextId++,
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
        etagVariant: undefined,
        etagByEnvEnabled: false,
    },
    {
        etagVariant: 'v2',
        etagByEnvEnabled: false,
    },
    {
        etagVariant: 'v2',
        etagByEnvEnabled: true,
    },
])(
    'feature 304 api client (etag variant = $etagVariant)',
    ({ etagVariant, etagByEnvEnabled }) => {
        let app: IUnleashTest;
        let db: ITestDb;
        const etagVariantEnabled = etagVariant !== undefined;
        const etagVariantName = etagVariant ?? 'disabled';
        const expectedDevEventId = etagByEnvEnabled ? 13 : 15;
        beforeAll(async () => {
            ({ app, db } = await setup({
                etagVariant,
                etagByEnvEnabled,
            }));
            await initialize({ app, db });
            await validateInitialState({ app, db });
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

            if (etagVariantEnabled) {
                expect(res.headers.etag).toBe(
                    `"76d8bb0e:${expectedDevEventId}:${etagVariantName}"`,
                );
                expect(res.body.meta.etag).toBe(
                    `"76d8bb0e:${expectedDevEventId}:${etagVariantName}"`,
                );
            } else {
                expect(res.headers.etag).toBe(
                    `"76d8bb0e:${expectedDevEventId}"`,
                );
                expect(res.body.meta.etag).toBe(
                    `"76d8bb0e:${expectedDevEventId}"`,
                );
            }
        });

        test(`returns ${etagVariantEnabled ? 200 : 304} for pre-calculated hash${etagVariantEnabled ? ' because hash changed' : ''} (dev env token)`, async () => {
            const res = await app.request
                .get('/api/client/features')
                .set('Authorization', devTokenSecret)
                .set('if-none-match', `"76d8bb0e:${expectedDevEventId}"`)
                .expect(etagVariantEnabled ? 200 : 304);

            if (etagVariantEnabled) {
                expect(res.headers.etag).toBe(
                    `"76d8bb0e:${expectedDevEventId}:${etagVariantName}"`,
                );
                expect(res.body.meta.etag).toBe(
                    `"76d8bb0e:${expectedDevEventId}:${etagVariantName}"`,
                );
            }
        });

        test('creating a new feature does not modify etag', async () => {
            await app.createFeature('new');
            await app.services.configurationRevisionService.updateMaxRevisionId();

            await app.request
                .get('/api/client/features')
                .set('Authorization', devTokenSecret)
                .set(
                    'if-none-match',
                    `"76d8bb0e:${expectedDevEventId}${etagVariantEnabled ? `:${etagVariantName}` : ''}"`,
                )
                .expect(304);
        });

        test('a token with all envs should get the max id regardless of the environment', async () => {
            const currentProdEtag = `"67e24428:15${etagVariantEnabled ? `:${etagVariantName}` : ''}"`;
            const { headers } = await app.request
                .get('/api/client/features')
                .set('if-none-match', currentProdEtag)
                .set('Authorization', allEnvsTokenSecret)
                .expect(200);

            // it's a different hash than prod, but gets the max id
            expect(headers.etag).toEqual(
                `"ae443048:15${etagVariantEnabled ? `:${etagVariantName}` : ''}"`,
            );
        });

        test.runIf(!etagByEnvEnabled)(
            'production environment gets same event id in etag than development',
            async () => {
                const { headers: prodHeaders } = await app.request
                    .get('/api/client/features?bla=1')
                    .set('Authorization', prodTokenSecret)
                    .expect(200);

                expect(prodHeaders.etag).toEqual(
                    `"67e24428:15${etagVariantEnabled ? `:${etagVariantName}` : ''}"`,
                );

                const { headers: devHeaders } = await app.request
                    .get('/api/client/features')
                    .set('Authorization', devTokenSecret)
                    .expect(200);

                expect(devHeaders.etag).toEqual(
                    `"76d8bb0e:15${etagVariantEnabled ? `:${etagVariantName}` : ''}"`,
                );
            },
        );

        test.runIf(!etagByEnvEnabled)(
            'modifying dev environment also invalidates prod tokens',
            async () => {
                const currentDevEtag = `"76d8bb0e:${expectedDevEventId}${etagVariantEnabled ? `:${etagVariantName}` : ''}"`;
                const currentProdEtag = `"67e24428:15${etagVariantEnabled ? `:${etagVariantName}` : ''}"`;
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
                    .expect(200);

                const { headers: devHeaders } = await app.request
                    .get('/api/client/features')
                    .set('Authorization', devTokenSecret)
                    .set('if-none-match', currentDevEtag)
                    .expect(200);

                // Note: this test yields a different result if run in isolation
                // this is because the id 19 depends on a previous test adding a feature
                // otherwise the id will be 18
                expect(devHeaders.etag).toEqual(
                    `"76d8bb0e:19${etagVariantEnabled ? `:${etagVariantName}` : ''}"`,
                );
            },
        );

        test.runIf(etagByEnvEnabled)(
            'production environment gets a different etag than development',
            async () => {
                const { headers: prodHeaders } = await app.request
                    .get('/api/client/features?bla=1')
                    .set('Authorization', prodTokenSecret)
                    .expect(200);

                expect(prodHeaders.etag).toEqual(
                    `"67e24428:15${etagVariantEnabled ? `:${etagVariantName}` : ''}"`,
                );

                const { headers: devHeaders } = await app.request
                    .get('/api/client/features')
                    .set('Authorization', devTokenSecret)
                    .expect(200);

                expect(devHeaders.etag).toEqual(
                    `"76d8bb0e:13${etagVariantEnabled ? `:${etagVariantName}` : ''}"`,
                );
            },
        );

        test.runIf(etagByEnvEnabled)(
            'modifying dev environment should only invalidate dev tokens',
            async () => {
                const currentDevEtag = `"76d8bb0e:13${etagVariantEnabled ? `:${etagVariantName}` : ''}"`;
                const currentProdEtag = `"67e24428:15${etagVariantEnabled ? `:${etagVariantName}` : ''}"`;
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
                // this is because the id 19 depends on a previous test adding a feature
                // otherwise the id will be 18
                expect(devHeaders.etag).toEqual(
                    `"76d8bb0e:19${etagVariantEnabled ? `:${etagVariantName}` : ''}"`,
                );
            },
        );
    },
);
