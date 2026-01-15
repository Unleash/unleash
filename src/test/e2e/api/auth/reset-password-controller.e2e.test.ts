import type { URL } from 'url';
import EventEmitter from 'events';
import { createTestConfig } from '../../../config/test-config.js';
import type { IUnleashConfig } from '../../../../lib/types/option.js';
import UserService from '../../../../lib/services/user-service.js';
import { AccessService } from '../../../../lib/services/access-service.js';
import ResetTokenService from '../../../../lib/services/reset-token-service.js';
import type { IUser } from '../../../../lib/types/user.js';
import {
    type IUnleashTest,
    setupApp,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { EmailService } from '../../../../lib/services/email-service.js';
import SessionStore from '../../../../lib/db/session-store.js';
import SessionService from '../../../../lib/services/session-service.js';
import { RoleName } from '../../../../lib/types/model.js';
import SettingService from '../../../../lib/services/setting-service.js';
import FakeSettingStore from '../../../fixtures/fake-setting-store.js';
import { GroupService } from '../../../../lib/services/group-service.js';
import {
    type IUnleashStores,
    TEST_AUDIT_USER,
} from '../../../../lib/types/index.js';
import { createEventsService } from '../../../../lib/features/index.js';
import { ResourceLimitsService } from '../../../../lib/features/resource-limits/resource-limits-service.js';
import { beforeAll, test, afterAll, expect } from 'vitest';

let app: IUnleashTest;
let stores: IUnleashStores;
let db: ITestDb;
const config: IUnleashConfig = createTestConfig({
    getLogger,
    server: {
        unleashUrl: 'http://localhost:3000',
        baseUriPath: '',
    },
    email: {
        host: 'test',
    },
});
const password = 'DtUYwi&l5I1KX4@Le';
let userService: UserService;
let accessService: AccessService;
let resetTokenService: ResetTokenService;
let adminUser: IUser;
let user: IUser;

const getBackendResetUrl = (url: URL): string => {
    const urlString = url.toString();

    const params = urlString.substring(urlString.indexOf('?'));
    return `/auth/reset/validate${params}`;
};

beforeAll(async () => {
    db = await dbInit('reset_password_api_serial', getLogger);
    stores = db.stores;
    app = await setupApp(stores);
    const eventService = createEventsService(db.rawDatabase, config);
    const groupService = new GroupService(stores, config, eventService);
    accessService = new AccessService(
        stores,
        config,
        groupService,
        eventService,
    );
    const emailService = new EmailService(config);
    const sessionStore = new SessionStore(
        db.rawDatabase,
        new EventEmitter(),
        config.getLogger,
    );
    const sessionService = new SessionService({ sessionStore }, config);
    const settingService = new SettingService(
        {
            settingStore: new FakeSettingStore(),
        },
        config,
        eventService,
    );
    const resourceLimitsService = new ResourceLimitsService(config);
    userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
        resourceLimitsService,
    });
    resetTokenService = new ResetTokenService(stores, config);
    const adminRole = (await accessService.getPredefinedRole(RoleName.ADMIN))!;
    adminUser = await userService.createUser(
        {
            username: 'admin@test.com',
            rootRole: adminRole.id,
        },
        TEST_AUDIT_USER,
    )!;

    const userRole = (await accessService.getPredefinedRole(RoleName.EDITOR))!;
    user = await userService.createUser(
        {
            username: 'test@test.com',
            email: 'test@test.com',
            rootRole: userRole.id,
        },
        TEST_AUDIT_USER,
    );
});

afterAll(async () => {
    await stores.resetTokenStore.deleteAll();
    await app.destroy();
    await db.destroy();
});

test('Can validate token for password reset', async () => {
    const url = await resetTokenService.createResetPasswordUrl(
        user.id,
        adminUser.username!,
    );
    const relative = getBackendResetUrl(url);
    return app.request
        .get(relative)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.email).toBe(user.email);
        });
});

test('Can use token to reset password', async () => {
    const url = await resetTokenService.createResetPasswordUrl(
        user.id,
        adminUser.username!,
    );
    const relative = getBackendResetUrl(url);
    // Can't login before reset
    await expect(async () =>
        userService.loginUser(user.email!, password),
    ).rejects.toThrow(Error);

    let token: string | undefined;
    await app.request
        .get(relative)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            token = res.body.token;
        });
    await app.request
        .post('/auth/reset/password')
        .send({
            token,
            password,
        })
        .expect(200);
    const loggedInUser = await userService.loginUser(user.email!, password);
    expect(user.email).toBe(loggedInUser.email);
});

test('Trying to reset password with same token twice does not work', async () => {
    const url = await resetTokenService.createResetPasswordUrl(
        user.id,
        adminUser.username!,
    );
    const relative = getBackendResetUrl(url);
    let token: string | undefined;
    await app.request
        .get(relative)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            token = res.body.token;
        });
    await app.request
        .post('/auth/reset/password')
        .send({
            token,
            password: `${password}test`,
        })
        .expect(200);
    await app.request
        .post('/auth/reset/password')
        .send({
            token,
            password: `${password}othertest`,
        })
        .expect(401)
        .expect((res) => {
            expect(res.body.details[0].message).toBeTruthy();
        });
});

test('Invalid token should yield 401', async () =>
    app.request.get('/auth/reset/validate?token=abc123').expect((res) => {
        expect(res.status).toBe(401);
    }));

test('Calling validate endpoint with already existing session should destroy session', async () => {
    expect.assertions(0);
    const { request, destroy } = await setupAppWithAuth(stores);
    await request
        .post('/auth/demo/login')
        .send({
            email: 'user@mail.com',
        })
        .expect(200);
    await request.get('/api/admin/projects').expect(200);
    const url = await resetTokenService.createResetPasswordUrl(
        user.id,
        adminUser.username!,
    );
    const relative = getBackendResetUrl(url);

    await request.get(relative).expect(200).expect('Content-Type', /json/);
    await request.get('/api/admin/projects').expect(401); // we no longer should have a valid session
    await destroy();
});

test('Calling reset endpoint with already existing session should logout/destroy existing session', async () => {
    expect.assertions(0);
    const { request, destroy } = await setupAppWithAuth(stores);
    const url = await resetTokenService.createResetPasswordUrl(
        user.id,
        adminUser.username!,
    );
    const relative = getBackendResetUrl(url);
    let token: string | undefined;
    await request
        .get(relative)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            token = res.body.token;
        });
    await request
        .post('/auth/demo/login')
        .send({
            email: 'user@mail.com',
        })
        .expect(200);
    await request.get('/api/admin/projects').expect(200); // If we login we can access projects endpoint
    await request
        .post('/auth/reset/password')
        .send({
            token,
            password: `${password}newpassword`,
        })
        .expect(200);
    await request.get('/api/admin/projects').expect(401); // we no longer have a valid session after using the reset password endpoint
    await destroy();
});

test('Trying to change password with an invalid token should yield 401', async () =>
    app.request
        .post('/auth/reset/password')
        .send({
            token: 'abc123',
            password,
        })
        .expect((res) => expect(res.status).toBe(401)));

test('Trying to change password to undefined should yield 400 without crashing the server', async () => {
    expect.assertions(0);

    const url = await resetTokenService.createResetPasswordUrl(
        user.id,
        adminUser.username!,
    );
    const relative = getBackendResetUrl(url);
    let token: string | undefined;
    await app.request
        .get(relative)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            token = res.body.token;
        });
    await app.request
        .post('/auth/reset/password')
        .send({
            token,
            password: undefined,
        })
        .expect(400);
});

test('changing password should expire all active tokens', async () => {
    const url = await resetTokenService.createResetPasswordUrl(
        user.id,
        adminUser.username!,
    );
    const relative = getBackendResetUrl(url);

    const {
        body: { token },
    } = await app.request
        .get(relative)
        .expect(200)
        .expect('Content-Type', /json/);

    await app.request
        .post(`/api/admin/user-admin/${user.id}/change-password`)
        .send({ password: 'simple123-_ASsad' })
        .expect(200);

    await app.request
        .post('/auth/reset/password')
        .send({
            token,
            password,
        })
        .expect(401);
});
