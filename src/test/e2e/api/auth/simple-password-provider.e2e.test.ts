import { createTestConfig } from '../../../config/test-config';
import {
    type IUnleashConfig,
    type IUnleashStores,
    TEST_AUDIT_USER,
} from '../../../../lib/types';
import UserService from '../../../../lib/services/user-service';
import { AccessService } from '../../../../lib/services/access-service';
import type { IUser } from '../../../../lib/types/user';
import { type IUnleashTest, setupApp } from '../../helpers/test-helper';
import dbInit, { type ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { EmailService } from '../../../../lib/services/email-service';
import SessionService from '../../../../lib/services/session-service';
import { RoleName } from '../../../../lib/types/model';
import SettingService from '../../../../lib/services/setting-service';
import { GroupService } from '../../../../lib/services/group-service';
import ResetTokenService from '../../../../lib/services/reset-token-service';
import { createEventsService } from '../../../../lib/features';

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
let adminUser: IUser;

beforeAll(async () => {
    db = await dbInit('simple_password_provider_api_serial', getLogger);
    stores = db.stores;
    app = await setupApp(stores);
    const eventService = createEventsService(db.rawDatabase, config);
    const groupService = new GroupService(stores, config, eventService);
    const accessService = new AccessService(
        stores,
        config,
        groupService,
        eventService,
    );
    const resetTokenService = new ResetTokenService(stores, config);
    const emailService = new EmailService(config);
    const sessionService = new SessionService(stores, config);
    const settingService = new SettingService(stores, config, eventService);

    userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });
    const adminRole = await accessService.getPredefinedRole(RoleName.ADMIN);
    adminUser = await userService.createUser(
        {
            username: 'admin@test.com',
            email: 'admin@test.com',
            rootRole: adminRole!.id,
            password: password,
        },
        TEST_AUDIT_USER,
    );
});

beforeEach(async () => {
    app = await setupApp(stores);
});

afterEach(async () => {
    await app.destroy();
});

afterAll(async () => {
    await db.destroy();
});

test('Can log in', async () => {
    await app.request
        .post('/auth/simple/login')
        .send({
            username: adminUser.username,
            password,
        })
        .expect(200);
});

test('Gets rate limited after 10 tries', async () => {
    for (const statusCode of [...Array(10).fill(200), 429]) {
        await app.request
            .post('/auth/simple/login')
            .send({
                username: adminUser.username,
                password,
            })
            .expect(statusCode);
    }
});
