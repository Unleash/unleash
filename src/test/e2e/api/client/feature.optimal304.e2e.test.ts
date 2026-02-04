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

async function setup(): Promise<{ app: IUnleashTest; db: ITestDb }> {
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
}: {
    app: IUnleashTest;
    db: ITestDb;
}) {
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

describe('feature 304 api client', () => {
    let app: IUnleashTest;
    let db: ITestDb;
    const expectedDevEventId = 16;
    beforeAll(async () => {
        ({ app, db } = await setup());
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

        expect(res.headers.etag).toBe(`"76d8bb0e:${expectedDevEventId}:v1"`);
        expect(res.body.meta.etag).toBe(`"76d8bb0e:${expectedDevEventId}:v1"`);
    });

    test(`returns 200 for pre-calculated hash because hash changed (dev env token)`, async () => {
        const res = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .set('if-none-match', `"76d8bb0e:${expectedDevEventId}"`)
            .expect(200);

        expect(res.headers.etag).toBe(`"76d8bb0e:${expectedDevEventId}:v1"`);
        expect(res.body.meta.etag).toBe(`"76d8bb0e:${expectedDevEventId}:v1"`);
    });

    test('creating a new feature modifies etag', async () => {
        await app.createFeature('new');
        await app.services.configurationRevisionService.updateMaxRevisionId();

        await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .set('if-none-match', `"76d8bb0e:${expectedDevEventId}:v1"`)
            .expect(200);
    });

    test('a token with all envs should get the max id regardless of the environment', async () => {
        const currentProdEtag = `"67e24428:15:v1"`;
        const { headers } = await app.request
            .get('/api/client/features')
            .set('if-none-match', currentProdEtag)
            .set('Authorization', allEnvsTokenSecret)
            .expect(200);

        // it's a different hash than prod, but gets the max id
        expect(headers.etag).toEqual(`"ae443048:15:v1"`);
    });

    test('production environment gets a different etag than development', async () => {
        const { headers: prodHeaders } = await app.request
            .get('/api/client/features?bla=1')
            .set('Authorization', prodTokenSecret)
            .expect(200);

        expect(prodHeaders.etag).toEqual(`"67e24428:17:v1"`);

        const { headers: devHeaders } = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .expect(200);

        expect(devHeaders.etag).toEqual(`"76d8bb0e:17:v1"`);
    });

    test('modifying dev environment should only invalidate dev tokens', async () => {
        const currentDevEtag = `"76d8bb0e:17:v1"`;
        const currentProdEtag = `"67e24428:17:v1"`;
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
        expect(devHeaders.etag).toEqual(`"76d8bb0e:19:v1"`);
    });
});
