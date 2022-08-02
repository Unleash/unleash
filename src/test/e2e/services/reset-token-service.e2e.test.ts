import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import ResetTokenService from '../../../lib/services/reset-token-service';
import UserService from '../../../lib/services/user-service';
import { AccessService } from '../../../lib/services/access-service';
import { EmailService } from '../../../lib/services/email-service';
import { IUnleashConfig } from '../../../lib/types/option';
import { createTestConfig } from '../../config/test-config';
import SessionService from '../../../lib/services/session-service';
import InvalidTokenError from '../../../lib/error/invalid-token-error';
import { IUser } from '../../../lib/types/user';
import SettingService from '../../../lib/services/setting-service';
import FakeSettingStore from '../../fixtures/fake-setting-store';
import { GroupService } from '../../../lib/services/group-service';
import FakeEventStore from '../../fixtures/fake-event-store';

const config: IUnleashConfig = createTestConfig();

let stores;
let db;
let adminUser;
let userToCreateResetFor: IUser;
let userIdToCreateResetFor: number;
let accessService: AccessService;
let userService: UserService;
let resetTokenService: ResetTokenService;
let sessionService: SessionService;
beforeAll(async () => {
    db = await dbInit('reset_token_service_serial', getLogger);
    stores = db.stores;
    const groupService = new GroupService(stores, config);
    accessService = new AccessService(stores, config, groupService);
    resetTokenService = new ResetTokenService(stores, config);
    sessionService = new SessionService(stores, config);
    const emailService = new EmailService(undefined, config.getLogger);
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

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

test('Should create a reset link', async () => {
    const url = await resetTokenService.createResetPasswordUrl(
        userIdToCreateResetFor,
        adminUser,
    );

    expect(url.toString().substring(0, url.toString().indexOf('='))).toBe(
        `${config.server.unleashUrl}/reset-password?token`,
    );
});

test('Should create a reset link with unleashUrl with context path', async () => {
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
    expect(url.toString().substring(0, url.toString().indexOf('='))).toBe(
        `${localConfig.server.unleashUrl}/reset-password?token`,
    );
});

test('Should create a welcome link', async () => {
    const url = await resetTokenService.createNewUserUrl(
        userIdToCreateResetFor,
        adminUser.username,
    );
    const urlS = url.toString();
    expect(urlS.substring(0, urlS.indexOf('='))).toBe(
        `${config.server.unleashUrl}/new-user?token`,
    );
});

test('Tokens should be one-time only', async () => {
    const token = await resetTokenService.createToken(
        userIdToCreateResetFor,
        adminUser,
    );

    const accessGranted = await resetTokenService.useAccessToken(token);
    expect(accessGranted).toBe(true);
    const secondGo = await resetTokenService.useAccessToken(token);
    expect(secondGo).toBe(false);
});

test('Creating a new token should expire older tokens', async () => {
    const firstToken = await resetTokenService.createToken(
        userIdToCreateResetFor,
        adminUser,
    );
    const secondToken = await resetTokenService.createToken(
        userIdToCreateResetFor,
        adminUser,
    );
    await expect(async () =>
        resetTokenService.isValid(firstToken.token),
    ).rejects.toThrow(InvalidTokenError);
    const validToken = await resetTokenService.isValid(secondToken.token);
    expect(secondToken.token).toBe(validToken.token);
});

test('Retrieving valid invitation links should retrieve an object with userid key and token value', async () => {
    const token = await resetTokenService.createToken(
        userIdToCreateResetFor,
        adminUser,
    );
    expect(token).toBeTruthy();
    const activeInvitations = await resetTokenService.getActiveInvitations();
    expect(Object.keys(activeInvitations).length === 1).toBe(true);
    expect(+Object.keys(activeInvitations)[0] === userIdToCreateResetFor).toBe(
        true,
    );
    expect(activeInvitations[userIdToCreateResetFor]).toBeTruthy();
});
