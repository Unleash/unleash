import dbInit, { type ITestDb } from './helpers/database-init.js';
import { setupAppWithCustomAuth } from './helpers/test-helper.js';
import {
    type CustomAuthHandler,
    type IUnleashStores,
    RoleName,
} from '../../lib/types/index.js';
import { vi } from 'vitest';

let db: ITestDb;
let stores: IUnleashStores;

const preHook: CustomAuthHandler = (app, _config, services) => {
    const { userService, accessService } = services!;
    app.use('/api/admin/', async (req, _res, next) => {
        const role = await accessService.getPredefinedRole(RoleName.EDITOR);
        // @ts-expect-error user is not defined on Request type
        req.user = await userService.createUser({
            email: 'editor2@example.com',
            rootRole: role.id,
        });
        next();
    });
};

beforeAll(async () => {
    db = await dbInit('custom_auth_serial');
    stores = db.stores;
});

afterAll(async () => {
    await db.destroy();
});

test('Using custom auth type without defining custom middleware causes default DENY ALL policy to take effect', async () => {
    vi.spyOn(global.console, 'error').mockImplementation(() => vi.fn());
    const { request, destroy } = await setupAppWithCustomAuth(
        stores,
        undefined,
    );
    await request
        .get('/api/admin/projects')
        .expect(401)
        .expect((res) => {
            expect(res.body.error).toBe(
                'You have to configure a custom authentication middleware. Read https://docs.getunleash.io/deploy/configuring-unleash for more details',
            );
        });
    await destroy();
});

test('If actually configuring a custom middleware should configure the middleware', async () => {
    expect.assertions(0);
    const { request, destroy } = await setupAppWithCustomAuth(stores, preHook);
    await request.get('/api/admin/projects').expect(200);
    await destroy();
});
