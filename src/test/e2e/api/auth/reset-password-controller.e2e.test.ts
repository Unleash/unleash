import test from 'ava';
import { URL } from 'url';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';

import {
    AccessService,
    RoleName,
} from '../../../../lib/services/access-service';
import ResetTokenService from '../../../../lib/services/reset-token-service';
import UserService from '../../../../lib/services/user-service';
import { IUnleashConfig } from '../../../../lib/types/core';
import { setupApp } from '../../helpers/test-helper';
import { EmailService } from '../../../../lib/services/email-service';
import User from '../../../../lib/user';

let stores;
let db;
const config: IUnleashConfig = {
    getLogger,
    unleashUrl: 'http://localhost:3000',
    baseUriPath: '',
    authentication: { enableApiToken: true, createAdminUser: false },
};
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

    userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
    });
    resetTokenService = new ResetTokenService(stores, config);
    const adminRole = await accessService.getRootRole(RoleName.ADMIN);
    adminUser = await userService.createUser({
        username: 'admin@test.com',
        rootRole: adminRole.id,
    });

    const userRole = await accessService.getRootRole(RoleName.REGULAR);
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
    t.throwsAsync<Error>(
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
