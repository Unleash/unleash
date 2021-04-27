import test from 'ava';
import sinon from 'sinon';
import { URL } from 'url';
import EventEmitter from 'events';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';

import {
    AccessService,
    RoleName,
} from '../../../../lib/services/access-service';
import ResetTokenService from '../../../../lib/services/reset-token-service';
import UserService from '../../../../lib/services/user-service';
import { setupApp, setupAppWithAuth } from '../../helpers/test-helper';
import { EmailService } from '../../../../lib/services/email-service';
import User from '../../../../lib/types/user';
import { IUnleashConfig } from '../../../../lib/types/option';
import { createTestConfig } from '../../../config/test-config';
import SessionStore from '../../../../lib/db/session-store';
import SessionService from '../../../../lib/services/session-service';

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
let adminUser: User;
let user: User;

const getBackendResetUrl = (url: URL): string => {
    const urlString = url.toString();

    const params = urlString.substring(urlString.indexOf('?'));
    return `/auth/reset/validate${params}`;
};

test.before(async () => {
    db = await dbInit('reset_password_api_serial', getLogger);
    stores = db.stores;
    accessService = new AccessService(stores, config);
    const emailService = new EmailService(config.email, config.getLogger);
    const sessionStore = new SessionStore(
        db,
        new EventEmitter(),
        config.getLogger,
    );
    const sessionService = new SessionService({ sessionStore }, config);
    userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
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

test.afterEach.always(async () => {
    await stores.resetTokenStore.deleteAll();
});

test.after(async () => {
    await db.destroy();
});

test.serial('Can validate token for password reset', async t => {
    const request = await setupApp(stores);
    const url = await resetTokenService.createResetPasswordUrl(
        user.id,
        adminUser.username,
    );
    const relative = getBackendResetUrl(url);
    return request
        .get(relative)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            t.is(res.body.email, user.email);
        });
});

test.serial('Can use token to reset password', async t => {
    const request = await setupApp(stores);
    const url = await resetTokenService.createResetPasswordUrl(
        user.id,
        adminUser.username,
    );
    const relative = getBackendResetUrl(url);
    // Can't login before reset
    await t.throwsAsync<Error>(
        async () => userService.loginUser(user.email, password),
        {
            instanceOf: Error,
        },
    );

    let token;
    await request
        .get(relative)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            token = res.body.token;
        });
    await request
        .post('/auth/reset/password')
        .send({
            token,
            password,
        })
        .expect(200);
    const loggedInUser = await userService.loginUser(user.email, password);
    t.is(user.email, loggedInUser.email);
});

test.serial(
    'Trying to reset password with same token twice does not work',
    async t => {
        const request = await setupApp(stores);
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
            .expect(res => {
                token = res.body.token;
            });
        await request
            .post('/auth/reset/password')
            .send({
                email: user.email,
                token,
                password,
            })
            .expect(200);
        await request
            .post('/auth/reset/password')
            .send({
                email: user.email,
                token,
                password,
            })
            .expect(403)
            .expect(res => {
                t.truthy(res.body.details[0].message);
            });
    },
);

test.serial('Invalid token should yield 401', async t => {
    const request = await setupApp(stores);
    return request.get('/auth/reset/validate?token=abc123').expect(res => {
        t.is(res.status, 401);
    });
});

test.serial(
    'Calling validate endpoint with already existing session should destroy session',
    async t => {
        t.plan(0);
        const request = await setupAppWithAuth(stores);
        await request
            .post('/api/admin/login')
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

        await request
            .get(relative)
            .expect(200)
            .expect('Content-Type', /json/);
        await request.get('/api/admin/features').expect(401); // we no longer should have a valid session
    },
);

test.serial(
    'Calling reset endpoint with already existing session should logout/destroy existing session',
    async t => {
        t.plan(0);
        const request = await setupAppWithAuth(stores);
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
            .expect(res => {
                token = res.body.token;
            });
        await request
            .post('/api/admin/login')
            .send({
                email: 'user@mail.com',
            })
            .expect(200);
        await request.get('/api/admin/features').expect(200); // If we login we can access features endpoint
        await request
            .post('/auth/reset/password')
            .send({
                email: user.email,
                token,
                password,
            })
            .expect(200);
        await request.get('/api/admin/features').expect(401); // we no longer have a valid session after using the reset password endpoint
    },
);

test.serial(
    'Trying to change password with an invalid token should yield 401',
    async t => {
        const request = await setupApp(stores);
        return request
            .post('/auth/reset/password')
            .send({
                token: 'abc123',
                password,
            })
            .expect(res => t.is(res.status, 401));
    },
);

test.serial(
    'Trying to change password to undefined should yield 400 without crashing the server',
    async t => {
        t.plan(0);
        const request = await setupApp(stores);
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
            .expect(res => {
                token = res.body.token;
            });
        await request
            .post('/auth/reset/password')
            .send({
                email: user.email,
                token,
                password: undefined,
            })
            .expect(400);
    },
);
