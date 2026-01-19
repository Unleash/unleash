import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';
import ResetTokenService from '../../../lib/services/reset-token-service.js';
import UserService from '../../../lib/services/user-service.js';
import { AccessService } from '../../../lib/services/access-service.js';
import { EmailService } from '../../../lib/services/email-service.js';
import type { IUnleashConfig } from '../../../lib/types/option.js';
import { createTestConfig } from '../../config/test-config.js';
import SessionService from '../../../lib/services/session-service.js';
import InvalidTokenError from '../../../lib/error/invalid-token-error.js';
import type { IUser, IUserWithRootRole } from '../../../lib/types/user.js';
import SettingService from '../../../lib/services/setting-service.js';
import FakeSettingStore from '../../fixtures/fake-setting-store.js';
import { GroupService } from '../../../lib/services/group-service.js';
import {
    type IUnleashStores,
    TEST_AUDIT_USER,
} from '../../../lib/types/index.js';
import { createEventsService } from '../../../lib/features/index.js';
import { ResourceLimitsService } from '../../../lib/features/resource-limits/resource-limits-service.js';

const config: IUnleashConfig = createTestConfig();
let stores: IUnleashStores;
let db: ITestDb;
let adminUser: IUserWithRootRole;
let userToCreateResetFor: IUser;
let userIdToCreateResetFor: number;
let accessService: AccessService;
let userService: UserService;
let resetTokenService: ResetTokenService;
let sessionService: SessionService;
beforeAll(async () => {
    db = await dbInit('reset_token_service_serial', getLogger);
    stores = db.stores;
    const eventService = createEventsService(db.rawDatabase, config);
    const groupService = new GroupService(stores, config, eventService);
    accessService = new AccessService(
        stores,
        config,
        groupService,
        eventService,
    );
    resetTokenService = new ResetTokenService(stores, config);
    sessionService = new SessionService(stores, config);
    const emailService = new EmailService(config);
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

    adminUser = await userService.createUser(
        {
            username: 'admin@test.com',
            rootRole: 1,
        },
        TEST_AUDIT_USER,
    );

    userToCreateResetFor = await userService.createUser(
        {
            username: 'test@test.com',
            rootRole: 2,
        },
        TEST_AUDIT_USER,
    );
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
        adminUser.username!,
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
        adminUser.username!,
    );
    expect(url.toString().substring(0, url.toString().indexOf('='))).toBe(
        `${localConfig.server.unleashUrl}/reset-password?token`,
    );
});

test('Should create a welcome link', async () => {
    const url = await resetTokenService.createNewUserUrl(
        userIdToCreateResetFor,
        adminUser.username!,
    );
    const urlS = url.toString();
    expect(urlS.substring(0, urlS.indexOf('='))).toBe(
        `${config.server.unleashUrl}/new-user?token`,
    );
});

test('Tokens should be one-time only', async () => {
    const token = await resetTokenService.createToken(
        userIdToCreateResetFor,
        adminUser.username!,
    );

    const accessGranted = await resetTokenService.useAccessToken(token);
    expect(accessGranted).toBe(true);
    const secondGo = await resetTokenService.useAccessToken(token);
    expect(secondGo).toBe(false);
});

test('Creating a new token should expire older tokens', async () => {
    const firstToken = await resetTokenService.createToken(
        userIdToCreateResetFor,
        adminUser.username!,
    );
    const secondToken = await resetTokenService.createToken(
        userIdToCreateResetFor,
        adminUser.username!,
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
        adminUser.username!,
    );
    expect(token).toBeTruthy();
    const activeInvitations = await resetTokenService.getActiveInvitations();
    expect(Object.keys(activeInvitations).length === 1).toBe(true);
    expect(+Object.keys(activeInvitations)[0] === userIdToCreateResetFor).toBe(
        true,
    );
    expect(activeInvitations[userIdToCreateResetFor]).toBeTruthy();
});
