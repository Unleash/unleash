import { URL } from 'url';
import EventEmitter from 'events';
import { createTestConfig } from '../../../config/test-config';
import { IUnleashConfig } from '../../../../lib/types/option';
import UserService from '../../../../lib/services/user-service';
import { AccessService } from '../../../../lib/services/access-service';
import ResetTokenService from '../../../../lib/services/reset-token-service';
import { IUser } from '../../../../lib/types/user';
import { setupApp, setupAppWithAuth } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { EmailService } from '../../../../lib/services/email-service';
import SessionStore from '../../../../lib/db/session-store';
import SessionService from '../../../../lib/services/session-service';
import { RoleName } from '../../../../lib/types/model';
import SettingService from '../../../../lib/services/setting-service';
import FakeSettingStore from '../../../fixtures/fake-setting-store';
import { GroupService } from '../../../../lib/services/group-service';
import FakeEventStore from '../../../fixtures/fake-event-store';

let app;
let stores;
let db;
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
    const groupService = new GroupService(stores, config);
    accessService = new AccessService(stores, config, groupService);
    const emailService = new EmailService(config.email, config.getLogger);
    const sessionStore = new SessionStore(
        db,
        new EventEmitter(),
        config.getLogger,
    );
    const sessionService = new SessionService({ sessionStore }, config);
    const settingService = new SettingService(
        {
            settingStore: new FakeSettingStore(),
            eventStore: new FakeEventStore(),
        },
        config,
    );
    userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
        settingService,
    });
    resetTokenService = new ResetTokenService(stores, config);
    const adminRole = await accessService.getRootRole(RoleName.ADMIN);
    adminUser = await userService.createUser({
        username: 'admin@test.com',
        rootRole: adminRole.id,
    });

    const userRole = await accessService.getRootRole(RoleName.EDITOR);
    user = await userService.createUser({
        username: 'test@test.com',
        email: 'test@test.com',
        rootRole: userRole.id,
    });
});

afterAll(async () => {
    await stores.resetTokenStore.deleteAll();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('Can validate token for password reset', async () => {
    const url = await resetTokenService.createResetPasswordUrl(
        user.id,
        adminUser.username,
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
        adminUser.username,
    );
    const relative = getBackendResetUrl(url);
    // Can't login before reset
    await expect(async () =>
        userService.loginUser(user.email, password),
    ).rejects.toThrow(Error);

    let token;
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
    const loggedInUser = await userService.loginUser(user.email, password);
    expect(user.email).toBe(loggedInUser.email);
});

test('Trying to reset password with same token twice does not work', async () => {
    const url = await resetTokenService.createResetPasswordUrl(
        user.id,
        adminUser.username,
    );
    const relative = getBackendResetUrl(url);
    let token;
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
    await app.request
        .post('/auth/reset/password')
        .send({
            token,
            password,
        })
        .expect(403)
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
    await request.get('/api/admin/features').expect(200);
    const url = await resetTokenService.createResetPasswordUrl(
        user.id,
        adminUser.username,
    );
    const relative = getBackendResetUrl(url);

    await request.get(relative).expect(200).expect('Content-Type', /json/);
    await request.get('/api/admin/features').expect(401); // we no longer should have a valid session
    await destroy();
});

test('Calling reset endpoint with already existing session should logout/destroy existing session', async () => {
    expect.assertions(0);
    const { request, destroy } = await setupAppWithAuth(stores);
    const url = await resetTokenService.createResetPasswordUrl(
        user.id,
        adminUser.username,
    );
    const relative = getBackendResetUrl(url);
    let token;
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
    await request.get('/api/admin/features').expect(200); // If we login we can access features endpoint
    await request
        .post('/auth/reset/password')
        .send({
            token,
            password,
        })
        .expect(200);
    await request.get('/api/admin/features').expect(401); // we no longer have a valid session after using the reset password endpoint
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
        adminUser.username,
    );
    const relative = getBackendResetUrl(url);
    let token;
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
