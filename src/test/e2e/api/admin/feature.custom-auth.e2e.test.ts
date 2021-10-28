import { setupAppWithCustomAuth } from '../../helpers/test-helper';
import AuthenticationRequired from '../../../../lib/types/authentication-required';

import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';

let stores;
let db;

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
        app.use('/api/admin/', (req, res) =>
            res
                .status('401')
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
    await request.get('/api/admin/features').expect(401);
    await destroy();
});

test('creates new feature toggle with createdBy', async () => {
    expect.assertions(1);
    const email = 'custom-user@mail.com';

    const preHook = (app, config, { userService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            req.user = await userService.loginUserWithoutPassword(email, true);
            next();
        });
    };
    const { request, destroy } = await setupAppWithCustomAuth(stores, preHook);

    // create toggle
    await request
        .post('/api/admin/features')
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
