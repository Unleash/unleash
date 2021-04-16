import test from 'ava';
import { IUnleashConfig } from '../../../lib/types/core';
import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import ResetTokenService from '../../../lib/services/reset-token-service';
import UserService from '../../../lib/services/user-service';
import { AccessService } from '../../../lib/services/access-service';
import NotFoundError from '../../../lib/error/notfound-error';
import { EmailService } from '../../../lib/services/email-service';
import User from '../../../lib/user';

const config: IUnleashConfig = {
    getLogger,
    baseUriPath: '',
    authentication: { enableApiToken: true, createAdminUser: false },
    unleashUrl: 'http://localhost:3000',
};

let stores;
let db;
let adminUser;
let userToCreateResetFor: User;
let userIdToCreateResetFor: number;
let accessService: AccessService;
let userService: UserService;
let resetTokenService: ResetTokenService;
test.before(async () => {
    db = await dbInit('reset_token_service_serial', getLogger);
    stores = db.stores;
    accessService = new AccessService(stores, config);
    resetTokenService = new ResetTokenService(stores, config);

    const emailService = new EmailService(config.email, config.getLogger);

    userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
    });

    adminUser = await userService.createUser({
        username: 'admin@test.com',
        rootRole: 1,
    });

    userToCreateResetFor = await userService.createUser({
        username: 'test@test.com',
        rootRole: 2,
    });
    userIdToCreateResetFor = userToCreateResetFor.id;
});

test.after.always(async () => {
    db.destroy();
});

test.serial('Should create a reset link', async t => {
    const url = await resetTokenService.createResetPasswordUrl(
        userIdToCreateResetFor,
        adminUser,
    );

    t.true(url.toString().indexOf('/reset-password') > 0);
});

test.serial('Should create a welcome link', async t => {
    const url = await resetTokenService.createWelcomeUrl(
        userIdToCreateResetFor,
        adminUser.username,
    );
    t.true(url.toString().indexOf('/new-user') > 0);
});

test.serial('Tokens should be one-time only', async t => {
    const token = await resetTokenService.createToken(
        userIdToCreateResetFor,
        adminUser,
    );

    const accessGranted = await resetTokenService.useAccessToken(token);
    t.is(accessGranted, true);
    const secondGo = await resetTokenService.useAccessToken(token);
    t.is(secondGo, false);
});

test.serial('Creating a new token should expire older tokens', async t => {
    const firstToken = await resetTokenService.createToken(
        userIdToCreateResetFor,
        adminUser,
    );
    const secondToken = await resetTokenService.createToken(
        userIdToCreateResetFor,
        adminUser,
    );
    await t.throwsAsync<NotFoundError>(async () =>
        resetTokenService.isValid(firstToken.token),
    );
    const validToken = await resetTokenService.isValid(secondToken.token);
    t.is(secondToken.token, validToken.token);
});
