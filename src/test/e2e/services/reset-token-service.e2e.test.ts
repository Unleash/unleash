import test from 'ava';
import { IUnleashConfig } from '../../../lib/types/core';
import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import ResetTokenService from '../../../lib/services/reset-token-service';
import UserService from '../../../lib/services/user-service';
import { AccessService } from '../../../lib/services/access-service';
import NotFoundError from '../../../lib/error/notfound-error';

const config: IUnleashConfig = {
    getLogger,
    baseUriPath: 'http://localhost:3000',
    authentication: { enableApiToken: true, createAdminUser: false },
};

let stores;
let db;
let adminUser;
let userToCreateResetFor;
let accessService;
let userService;
let resetTokenService;
test.before(async () => {
    db = await dbInit('reset_token_service_serial', getLogger);
    stores = db.stores;
    accessService = new AccessService(stores, config);
    resetTokenService = new ResetTokenService(stores, config);
    userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
    });
    adminUser = await userService.createUser({
        username: 'admin@test.com',
        rootRole: 1,
    });

    userToCreateResetFor = await userService.createUser({
        username: 'test@test.com',
        rootRole: 2,
    });
});

test.serial('Should create a reset link', async t => {
    const resetTokenService = new ResetTokenService(stores, config);
    const url = await resetTokenService.createResetUrl(
        userToCreateResetFor,
        adminUser,
    );

    t.true(url.toString().indexOf('token') > 0);
    t.truthy(url.searchParams.get('token'));
    //    t.true(url.searchParams.token.value.length > 0);
});

test.serial('Tokens should be one-time only', async t => {
    const token = await resetTokenService.createToken(
        userToCreateResetFor,
        adminUser,
    );

    const accessGranted = await resetTokenService.useAccessToken(token);
    t.is(accessGranted, true);
    const secondGo = await resetTokenService.useAccessToken(token);
    t.is(secondGo, false);
});

test.serial(
    'Tokens should be connected to the user they are created for',
    async t => {
        const token = await resetTokenService.createToken(
            userToCreateResetFor,
            adminUser,
        );
        t.is(token.userId, userToCreateResetFor.id);
        const accessGranted = await resetTokenService.useAccessToken({
            userId: adminUser.id,
            token: token.token,
        });
        t.is(accessGranted, false);
    },
);

test.serial('Creating a new token should expire older tokens', async t => {
    const firstToken = await resetTokenService.createToken(
        userToCreateResetFor,
        adminUser,
    );
    const secondToken = await resetTokenService.createToken(
        userToCreateResetFor,
        adminUser,
    );
    await t.throwsAsync<NotFoundError>(async () =>
        resetTokenService.isValid(firstToken),
    );
    const validToken = await resetTokenService.isValid(secondToken);
    t.is(secondToken.token, validToken.token);
});
