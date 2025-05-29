import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';
import { simpleAuthSettingsKey } from '../../../../lib/types/settings/simple-auth-settings.js';
import { RoleName, TEST_AUDIT_USER } from '../../../../lib/types/index.js';
import { addDays, minutesToMilliseconds } from 'date-fns';

let db: ITestDb;
let app: IUnleashTest;
beforeAll(async () => {
    db = await dbInit('config_api_serial', getLogger);

    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
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
    await app.services.settingService.deleteAll();
});

test('gets ui config fields', async () => {
    const { body } = await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.unleashUrl).toBe('http://localhost:4242');
    expect(body.version).toBeDefined();
    expect(body.emailEnabled).toBe(false);
});

test('gets ui config with disablePasswordAuth', async () => {
    await db.stores.settingStore.insert(simpleAuthSettingsKey, {
        disabled: true,
    });
    const { body } = await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.disablePasswordAuth).toBe(true);
});

test('gets ui config with frontendSettings', async () => {
    const frontendApiOrigins = ['https://example.net'];
    await app.services.frontendApiService.setFrontendCorsSettings(
        frontendApiOrigins,
        TEST_AUDIT_USER,
    );
    await app.request
        .get('/api/admin/ui-config')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) =>
            expect(res.body.frontendApiOrigins).toEqual(frontendApiOrigins),
        );
});

describe('maxSessionsCount', () => {
    beforeEach(async () => {
        // prevent memoization of session count
        await app?.destroy();
        app = await setupAppWithCustomConfig(
            db.stores,
            {
                experimental: {
                    flags: {
                        strictSchemaValidation: true,
                        showUserDeviceCount: true,
                    },
                },
            },
            db.rawDatabase,
        );
    });

    test('should return max sessions count', async () => {
        const { body: noLoggedInUsers } = await app.request
            .get(`/api/admin/ui-config`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(noLoggedInUsers.maxSessionsCount).toEqual(0);
    });

    test('should count number of session per user', async () => {
        const email = 'user@getunleash.io';

        const adminRole = (await db.stores.roleStore.getRootRoles()).find(
            (r) => r.name === RoleName.ADMIN,
        )!;
        const user = await app.services.userService.createUser(
            {
                email,
                password: 'test password',
                rootRole: adminRole.id,
            },
            TEST_AUDIT_USER,
        );

        const userSession = (index: number) => ({
            sid: `sid${index}`,
            sess: {
                cookie: {
                    originalMaxAge: minutesToMilliseconds(48),
                    expires: addDays(Date.now(), 1).toDateString(),
                    secure: false,
                    httpOnly: true,
                    path: '/',
                },
                user,
            },
        });

        for (let i = 0; i < 5; i++) {
            await app.services.sessionService.insertSession(userSession(i));
        }

        const { body: withSessions } = await app.request
            .get(`/api/admin/ui-config`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(withSessions.maxSessionsCount).toEqual(5);
    });
});
