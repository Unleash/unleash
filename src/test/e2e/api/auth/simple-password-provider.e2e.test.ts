import { createTestConfig } from '../../../config/test-config';
import { IUnleashConfig } from '../../../../lib/types';
import UserService from '../../../../lib/services/user-service';
import { AccessService } from '../../../../lib/services/access-service';
import { IUser } from '../../../../lib/types/user';
import { setupApp } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { EmailService } from '../../../../lib/services/email-service';
import SessionService from '../../../../lib/services/session-service';
import { RoleName } from '../../../../lib/types/model';
import SettingService from '../../../../lib/services/setting-service';
import { GroupService } from '../../../../lib/services/group-service';
import ResetTokenService from '../../../../lib/services/reset-token-service';

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
let adminUser: IUser;

beforeAll(async () => {
    db = await dbInit('simple_password_provider_api_serial', getLogger);
    stores = db.stores;
    app = await setupApp(stores);
    const groupService = new GroupService(stores, config);
    const accessService = new AccessService(stores, config, groupService);
    const resetTokenService = new ResetTokenService(stores, config);
    const emailService = new EmailService(undefined, config.getLogger);
    const sessionService = new SessionService(stores, config);
    const settingService = new SettingService(stores, config);

    userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
        settingService,
    });
    const adminRole = await accessService.getRootRole(RoleName.ADMIN);
    adminUser = await userService.createUser({
        username: 'admin@test.com',
        email: 'admin@test.com',
        rootRole: adminRole.id,
        password: password,
    });
});

afterAll(async () => {
    await app.destroy();
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

test('Gets rate limited after 5 tries', async () => {
    for (let statusCode of [200, 200, 200, 200, 429]) {
        await app.request
            .post('/auth/simple/login')
            .send({
                username: adminUser.username,
                password,
            })
            .expect(statusCode);
    }
});
