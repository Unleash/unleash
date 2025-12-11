import { setupAppWithCustomAuth } from '../../helpers/test-helper.js';
import AuthenticationRequired from '../../../../lib/types/authentication-required.js';

import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import type { IUnleashStores } from '../../../../lib/types/index.js';

let stores: IUnleashStores;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('feature_api_custom_auth', getLogger);
    stores = db.stores;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

test('should require authenticated user', async () => {
    expect.assertions(0);
    const preHook = (app) => {
        app.use('/api/admin/', (_req, res) =>
            res
                .status(401)
                .json(
                    new AuthenticationRequired({
                        path: '/auth/demo/login',
                        type: 'custom',
                        message: 'You have to identify yourself.',
                    }),
                )
                .end(),
        );
    };
    const { request, destroy } = await setupAppWithCustomAuth(stores, preHook);
    await request.get('/api/admin/projects/default/features').expect(401);
    await destroy();
});

test('creates new feature flag with createdBy', async () => {
    expect.assertions(1);
    const email = 'custom-user@mail.com';

    const preHook = (app, _config, { userService }) => {
        app.use('/api/admin/', async (req, _res, next) => {
            req.user = await userService.loginUserWithoutPassword(email, true);
            next();
        });
    };
    const { request, destroy } = await setupAppWithCustomAuth(
        stores,
        preHook,
        {},
        db.rawDatabase,
    );

    // create flag
    await request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'com.test.Username',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .expect(201);

    await request.get('/api/admin/events/com.test.Username').expect((res) => {
        expect(res.body.events[0].createdBy).toBe(email);
    });

    await destroy();
});
