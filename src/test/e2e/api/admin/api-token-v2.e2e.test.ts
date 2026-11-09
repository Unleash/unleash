import {
    ApiTokenType,
    SYSTEM_USER_AUDIT,
    SYSTEM_USER_ID,
    RoleName,
} from '../../../../lib/types/index.js';
import { AuthorizationTokenKind } from '../../../../lib/authentication/authorization-token.js';
import getLogger from '../../../fixtures/no-logger.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
    setupAppWithAuth,
    createUserWithRootRole,
} from '../../helpers/test-helper.js';
import { vi } from 'vitest';
import { ApiTokenV2Store } from '../../../../lib/features/apitokensv2/api-token-v2-store.js';

let db: ITestDb;
let app: IUnleashTest;

beforeAll(async () => {
    db = await dbInit('token_api_v2_serial', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {}, db.rawDatabase);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

afterEach(() => {
    vi.restoreAllMocks();
});

test('lists, updates, and deletes tokens across both token stores', async () => {
    const legacySecret = 'default:development.legacy-token';
    await db.stores.apiTokenStore.insert(
        {
            projects: ['default'],
            tokenName: 'legacy-token',
            secret: legacySecret,
            type: ApiTokenType.BACKEND,
            environment: 'development',
        },
        SYSTEM_USER_ID,
    );
    const secureTokenCredential =
        await app.services.transactionalApiTokenV2Service.create(
            {
                projects: ['default'],
                tokenName: 'secure-token',
                type: ApiTokenType.BACKEND,
                environment: 'development',
                userCreated: true,
            },
            SYSTEM_USER_AUDIT,
        );

    const listResponse = await app.request
        .get('/api/admin/api-tokens')
        .expect(200);

    expect(listResponse.body.tokens).toHaveLength(2);
    const secureToken = listResponse.body.tokens.find(
        (token) => token.tokenName === 'secure-token',
    );
    expect(secureToken.tokenName).toEqual('secure-token');

    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    await app.request
        .put(`/api/admin/api-tokens/${legacySecret}`)
        .send({ expiresAt })
        .expect(200);
    await app.request
        .put(`/api/admin/api-tokens/${secureToken.secret}`)
        .send({ expiresAt })
        .expect(200);

    const updatedResponse = await app.request
        .get('/api/admin/api-tokens')
        .expect(200);
    expect(updatedResponse.body.tokens).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                tokenName: 'legacy-token',
                expiresAt,
                secure: false,
            }),
            expect.objectContaining({
                tokenName: 'secure-token',
                expiresAt,
                secure: true,
            }),
        ]),
    );

    const deleteFrontendClient = vi.spyOn(
        app.services.frontendApiService,
        'deleteClientForFrontendApiToken',
    );
    await app.request
        .delete(`/api/admin/api-tokens/${secureTokenCredential.secret}`)
        .expect(200);
    expect(deleteFrontendClient).toHaveBeenCalledWith(
        secureTokenCredential.selector,
    );
    await app.request
        .delete(`/api/admin/api-tokens/${legacySecret}`)
        .expect(200);

    const emptyResponse = await app.request
        .get('/api/admin/api-tokens')
        .expect(200);
    expect(emptyResponse.body.tokens).toEqual([]);
});

test('lists, updates, and deletes secure tokens by selector', async () => {
    const created = await app.services.transactionalApiTokenV2Service.create(
        {
            projects: ['default'],
            tokenName: 'secure-token-after-rollback',
            type: ApiTokenType.BACKEND,
            environment: 'development',
            userCreated: true,
        },
        SYSTEM_USER_AUDIT,
    );

    const listResponse = await app.request
        .get('/api/admin/api-tokens')
        .expect(200);

    expect(listResponse.body.tokens).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                tokenName: 'secure-token-after-rollback',
                secret: created.selector,
                secure: true,
            }),
        ]),
    );

    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    await app.request
        .put(`/api/admin/api-tokens/${created.selector}`)
        .send({ expiresAt })
        .expect(200);

    const updatedResponse = await app.request
        .get('/api/admin/api-tokens')
        .expect(200);
    expect(updatedResponse.body.tokens).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                tokenName: 'secure-token-after-rollback',
                expiresAt,
            }),
        ]),
    );

    await app.request
        .delete(`/api/admin/api-tokens/${created.selector}`)
        .expect(200);

    const emptyResponse = await app.request
        .get('/api/admin/api-tokens')
        .expect(200);
    expect(emptyResponse.body.tokens).toEqual([]);
});

test('only warms the cache with recently seen non-expired secure tokens', async () => {
    const active = await app.services.transactionalApiTokenV2Service.create(
        {
            projects: ['default'],
            tokenName: 'active-secure-token',
            type: ApiTokenType.BACKEND,
            environment: 'development',
            userCreated: true,
        },
        SYSTEM_USER_AUDIT,
    );
    const expired = await app.services.transactionalApiTokenV2Service.create(
        {
            projects: ['default'],
            tokenName: 'expired-secure-token',
            type: ApiTokenType.BACKEND,
            environment: 'development',
            userCreated: true,
            expiresAt: new Date(Date.now() - 60_000),
        },
        SYSTEM_USER_AUDIT,
    );
    const getBySelector = vi.spyOn(ApiTokenV2Store.prototype, 'getBySelector');

    await db
        .rawDatabase('api_tokens_v2')
        .whereIn('selector', [active.selector, expired.selector])
        .update({ seen_at: new Date() });
    await app.services.apiTokenV2Service.initialize();

    await expect(
        app.services.apiTokenV2Service.getTokenWithCache({
            kind: AuthorizationTokenKind.API_TOKEN,
            version: 'v2',
            secret: active.secret,
            selector: active.selector,
        }),
    ).resolves.toMatchObject({ secret: active.selector });
    expect(getBySelector).not.toHaveBeenCalled();

    await expect(
        app.services.apiTokenV2Service.getTokenWithCache({
            kind: AuthorizationTokenKind.API_TOKEN,
            version: 'v2',
            secret: expired.secret,
            selector: expired.selector,
        }),
    ).resolves.toBeUndefined();
    expect(getBySelector).toHaveBeenCalledWith(expired.selector);
});

describe('application associations', () => {
    beforeAll(async () => {
        await db.stores.clientApplicationsStore.upsert({
            appName: 'configured-app',
        });
        await app.createFeature('associated-flag');
    });

    const payload = {
        tokenName: 'associated-token',
        type: ApiTokenType.BACKEND,
        projects: ['default'],
        environment: 'development',
        appName: 'configured-app',
    };

    const create = async (overrides = {}) =>
        (
            await app.request
                .post('/api/admin/api-tokens')
                .send({ ...payload, ...overrides })
                .expect(201)
        ).body;

    test('association errors do not disclose application names or existence', async () => {
        const { body } = await app.request
            .post('/api/admin/api-tokens')
            .send({ ...payload, appName: 'private-application' })
            .expect(400);
        const response = JSON.stringify(body);
        expect(response).toContain(
            'Unable to associate token with the requested Application',
        );
        expect(response).not.toContain('private-application');
        expect(response).not.toContain('does not exist');
        expect(response).not.toContain('api_tokens_v2_application_fkey');
    });

    test('association does not change appName in flag-evaluation context', async () => {
        await app.createFeature('application-context-flag');
        await app.services.featureToggleService.createStrategy(
            {
                name: 'default',
                parameters: {},
                constraints: [
                    {
                        contextName: 'appName',
                        operator: 'IN',
                        values: ['sdk-evaluation-context'],
                    },
                ],
            },
            {
                projectId: 'default',
                featureName: 'application-context-flag',
                environment: 'development',
            },
            SYSTEM_USER_AUDIT,
        );
        await app.services.featureToggleService.updateEnabled(
            'default',
            'application-context-flag',
            'development',
            true,
            SYSTEM_USER_AUDIT,
        );
        const token = await create({ type: ApiTokenType.FRONTEND });
        await app.services.frontendApiService.refreshData();
        const allowed = await app.request
            .get('/api/frontend?appName=sdk-evaluation-context')
            .set('Authorization', token.secret)
            .expect(200);
        expect(allowed.body.toggles).toContainEqual(
            expect.objectContaining({
                name: 'application-context-flag',
                enabled: true,
            }),
        );
        const other = await app.request
            .get('/api/frontend?appName=configured-app')
            .set('Authorization', token.secret)
            .expect(200);
        expect(
            other.body.toggles.some(
                (flag) => flag.name === 'application-context-flag',
            ),
        ).toBe(false);
    });

    test('associating a token does not expand its project scope', async () => {
        await db.stores.projectStore.create({
            id: 'outside-scope',
            name: 'Outside scope',
        });
        await app.createFeature('outside-scope-flag', 'outside-scope');
        const token = await create();
        const { body } = await app.request
            .get('/api/client/features')
            .set('Authorization', token.secret)
            .expect(200);
        expect(
            body.features.some((feature) => feature.name === 'associated-flag'),
        ).toBe(true);
        expect(
            body.features.some(
                (feature) => feature.name === 'outside-scope-flag',
            ),
        ).toBe(false);
    });

    test('association does not bypass token type creation permissions', async () => {
        const authApp = await setupAppWithAuth(db.stores, {}, db.rawDatabase);
        try {
            await createUserWithRootRole({
                app: authApp,
                stores: db.stores,
                email: 'association-viewer@example.com',
                roleName: RoleName.VIEWER,
            });
            await authApp.login({ email: 'association-viewer@example.com' });
            for (const appName of ['configured-app', 'private-application']) {
                const { body } = await authApp.request
                    .post('/api/admin/api-tokens')
                    .send({ ...payload, appName })
                    .expect(403);
                expect(JSON.stringify(body)).not.toContain(appName);
            }
        } finally {
            await authApp.destroy();
        }
    });

    test.each([true, false])(
        'direct backend reporting uses stored identity when linked: %s',
        async (linked) => {
            const token = await create({
                appName: linked ? 'configured-app' : undefined,
            });
            const reportedName = linked
                ? 'ignored-sdk-name'
                : 'unlinked-sdk-name';
            const expected = linked ? 'configured-app' : reportedName;
            const registration = {
                appName: reportedName,
                instanceId: `backend-${linked}`,
                strategies: ['default'],
                sdkVersion: 'unleash-client-test:1.0',
                interval: 10,
                started: Date.now(),
            };
            await app.request
                .post('/api/client/register')
                .set('Authorization', token.secret)
                .send(registration)
                .expect(202);
            const now = new Date().toISOString();
            await app.request
                .post('/api/client/metrics')
                .set('Authorization', token.secret)
                .send({
                    appName: reportedName,
                    instanceId: registration.instanceId,
                    bucket: {
                        start: now,
                        stop: now,
                        toggles: { 'associated-flag': { yes: 5, no: 2 } },
                    },
                })
                .expect(202);
            await app.services.clientInstanceService.bulkAdd();
            await app.services.clientMetricsServiceV2.bulkAdd();
            expect(
                await db.stores.clientApplicationsStore.exists(expected),
            ).toBe(true);
            const instances =
                await db.stores.clientInstanceStore.getByAppName(expected);
            expect(
                instances.some(
                    (instance) =>
                        instance.instanceId === registration.instanceId,
                ),
            ).toBe(true);
            const metrics = await db.stores.clientMetricsStoreV2.getAll({
                app_name: expected,
            });
            expect(metrics).toContainEqual(
                expect.objectContaining({
                    featureName: 'associated-flag',
                    yes: 5,
                    no: 2,
                }),
            );
            if (linked)
                expect(
                    await db.stores.clientApplicationsStore.exists(
                        reportedName,
                    ),
                ).toBe(false);
        },
    );

    test.each([true, false])(
        'frontend reporting uses stored identity when linked: %s',
        async (linked) => {
            const token = await create({
                type: ApiTokenType.FRONTEND,
                appName: linked ? 'configured-app' : undefined,
            });
            const now = new Date().toISOString();
            const reportedName = linked
                ? 'ignored-frontend-name'
                : 'unlinked-frontend-name';
            await app.request
                .post('/api/frontend/client/metrics')
                .set('Authorization', token.secret)
                .set('unleash-sdk', 'javascript:1.0')
                .send({
                    appName: reportedName,
                    instanceId: `frontend-${linked}`,
                    bucket: {
                        start: now,
                        stop: now,
                        toggles: { 'associated-flag': { yes: 3, no: 1 } },
                    },
                })
                .expect(200);
            await app.services.clientInstanceService.bulkAdd();
            await app.services.clientMetricsServiceV2.bulkAdd();
            const expected = linked ? 'configured-app' : reportedName;
            const metrics = await db.stores.clientMetricsStoreV2.getAll({
                app_name: expected,
            });
            expect(
                metrics.some(
                    (metric) =>
                        metric.featureName === 'associated-flag' &&
                        metric.yes >= 3,
                ),
            ).toBe(true);
            expect(
                (
                    await db.stores.clientInstanceStore.getByAppName(expected)
                ).some(
                    (instance) => instance.instanceId === `frontend-${linked}`,
                ),
            ).toBe(true);
        },
    );

    test('Edge bulk forwarding preserves consumer names instead of attributing aggregates to its credential', async () => {
        const token = await create();
        const now = new Date().toISOString();
        await app.request
            .post('/api/client/metrics/bulk')
            .set('Authorization', token.secret)
            .send({
                applications: ['consumer-a', 'consumer-b'].map((appName) => ({
                    appName,
                    instanceId: appName,
                    strategies: ['default'],
                    sdkVersion: 'edge:1.0',
                    interval: 10,
                    started: Date.now(),
                    environment: 'development',
                })),
                metrics: ['consumer-a', 'consumer-b'].map((appName) => ({
                    appName,
                    featureName: 'associated-flag',
                    environment: 'development',
                    timestamp: now,
                    yes: 2,
                    no: 1,
                })),
            })
            .expect(202);
        await app.services.clientInstanceService.bulkAdd();
        await app.services.clientMetricsServiceV2.bulkAdd();
        for (const appName of ['consumer-a', 'consumer-b']) {
            expect(
                await db.stores.clientApplicationsStore.exists(appName),
            ).toBe(true);
            expect(
                await db.stores.clientMetricsStoreV2.getAll({
                    app_name: appName,
                }),
            ).toContainEqual(expect.objectContaining({ yes: 2, no: 1 }));
        }
    });
});
