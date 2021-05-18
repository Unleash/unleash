import test from 'ava';
import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import ResetTokenService from '../../../lib/services/reset-token-service';
import UserService from '../../../lib/services/user-service';
import { AccessService } from '../../../lib/services/access-service';
import NotFoundError from '../../../lib/error/notfound-error';
import { EmailService } from '../../../lib/services/email-service';
import User from '../../../lib/types/user';
import { IUnleashConfig } from '../../../lib/types/option';
import { createTestConfig } from '../../config/test-config';
import SessionService from '../../../lib/services/session-service';

const config: IUnleashConfig = createTestConfig();

let stores;
let db;
let adminUser;
let userToCreateResetFor: User;
let userIdToCreateResetFor: number;
let accessService: AccessService;
let userService: UserService;
let resetTokenService: ResetTokenService;
let sessionService: SessionService;
test.before(async () => {
    db = await dbInit('reset_token_service_serial', getLogger);
    stores = db.stores;
    accessService = new AccessService(stores, config);
    resetTokenService = new ResetTokenService(stores, config);
    sessionService = new SessionService(stores, config);
    const emailService = new EmailService(undefined, config.getLogger);

    userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
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

    t.is(
        url.toString().substring(0, url.toString().indexOf('=')),
        `${config.server.unleashUrl}/reset-password?token`,
    );
});

test.serial(
    'Should create a reset link with unleashUrl with context path',
    async t => {
        const localConfig = createTestConfig({
            server: { unleashUrl: 'http://localhost:4242/my/sub/path' },
        });
        const resetToken: ResetTokenService = new ResetTokenService(
            stores,
            localConfig,
        );

        const url = await resetToken.createResetPasswordUrl(
            userIdToCreateResetFor,
            adminUser,
        );
        t.is(
            url.toString().substring(0, url.toString().indexOf('=')),
            `${localConfig.server.unleashUrl}/reset-password?token`,
        );
    },
);

test.serial('Should create a welcome link', async t => {
    const url = await resetTokenService.createNewUserUrl(
        userIdToCreateResetFor,
        adminUser.username,
    );
    const urlS = url.toString();
    t.is(
        urlS.substring(0, urlS.indexOf('=')),
        `${config.server.unleashUrl}/new-user?token`,
    );
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

test.serial(
    'Retrieving valid invitation links should retrieve an object with userid key and token value',
    async t => {
        const token = await resetTokenService.createToken(
            userIdToCreateResetFor,
            adminUser,
        );
        t.truthy(token);
        const activeInvitations = await resetTokenService.getActiveInvitations();
        t.true(Object.keys(activeInvitations).length === 1);
        t.true(+Object.keys(activeInvitations)[0] === userIdToCreateResetFor);
        t.truthy(activeInvitations[userIdToCreateResetFor]);
    },
);
