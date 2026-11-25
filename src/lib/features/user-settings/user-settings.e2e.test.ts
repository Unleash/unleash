import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    createUserWithRootRole,
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { ApiTokenType } from '../../types/model.js';
import { RoleName, TEST_AUDIT_USER } from '../../types/index.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('user_settings', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        { experimental: { flags: { userSettings: true } } },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

const saveSettings = (body: object) =>
    app.request
        .put('/api/admin/user/settings')
        .set('Content-Type', 'application/json')
        .send(body);

// Token tests run before any login, because the agent's session cookie would take precedence over the token.
test('refuses a signed-out caller', async () => {
    await saveSettings({
        settings: { 'unleash-theme': { value: 'dark' } },
    }).expect(401);
});

test('refuses an admin API token, which has no user', async () => {
    const adminToken =
        await app.services.apiTokenService.createApiTokenWithProjects({
            type: ApiTokenType.ADMIN,
            projects: ['*'],
            environment: '*',
            tokenName: 'admin-token',
        });

    await saveSettings({
        settings: { 'unleash-theme': { value: 'dark' } },
    })
        .set('Authorization', adminToken.secret)
        .expect(403);
});

test('accepts a personal access token of a user', async () => {
    const user = await createUserWithRootRole({
        app,
        stores: db.stores,
        email: 'pat-owner@getunleash.io',
        roleName: RoleName.VIEWER,
    });
    const { secret } = await app.services.patService.createPat(
        {
            description: 'user settings',
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
        user.id,
        TEST_AUDIT_USER,
    );

    await saveSettings({
        settings: { 'unleash-theme': { value: 'dark' } },
    })
        .set('Authorization', String(secret))
        .expect(204);
});

test('answers 404 while userSettings is off', async () => {
    const disabledApp = await setupAppWithAuth(db.stores, {}, db.rawDatabase);
    try {
        await disabledApp.request
            .post('/auth/demo/login')
            .send({ email: 'flag-off@getunleash.io' })
            .expect(200);
        await disabledApp.request
            .put('/api/admin/user/settings')
            .set('Content-Type', 'application/json')
            .send({ settings: { 'unleash-theme': { value: 'dark' } } })
            .expect(404);
    } finally {
        await disabledApp.destroy();
    }
});

describe('signed in', () => {
    let signedInUserId: number;

    beforeAll(async () => {
        const { body } = await app.request
            .post('/auth/demo/login')
            .send({ email: 'settings@getunleash.io' })
            .expect(200);
        signedInUserId = body.id;
    });

    test('saves the settings of the signed-in user', async () => {
        await saveSettings({
            settings: {
                'unleash-theme': { value: 'dark' },
                'feedback-module-survey-grace:v1': {
                    value: true,
                    expiresAt: '2026-12-01T12:00:00.000Z',
                },
            },
        }).expect(204);

        expect(
            await db
                .rawDatabase('user_settings')
                .where('user_id', signedInUserId)
                .orderBy('key')
                .select('key', 'value', 'expires_at as expiresAt'),
        ).toEqual([
            {
                key: 'feedback-module-survey-grace:v1',
                value: true,
                expiresAt: new Date('2026-12-01T12:00:00.000Z'),
            },
            { key: 'unleash-theme', value: 'dark', expiresAt: null },
        ]);
    });

    test.each([
        ['without settings', {}],
        ['with an unknown top-level field', { settings: {}, extra: true }],
        ['with an entry missing its value', { settings: { theme: {} } }],
        [
            'with a null expiry',
            { settings: { theme: { value: 'dark', expiresAt: null } } },
        ],
        [
            'with an expiry that is not a date-time',
            { settings: { theme: { value: 'dark', expiresAt: 'tomorrow' } } },
        ],
        [
            'with an unknown field in an entry',
            { settings: { theme: { value: 'dark', ttl: 1000 } } },
        ],
    ])('refuses a body %s', async (_, body) => {
        await saveSettings(body).expect(400);
    });
});
