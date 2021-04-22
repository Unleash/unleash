'use strict';;
const { setupAppWithCustomAuth } = require('../../helpers/test-helper');
const AuthenticationRequired = require('../../../../lib/authentication-required');

const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('feature_api_custom_auth', getLogger);
    stores = db.stores;
});

test(async () => {
    await db.destroy();
});

test('should require authenticated user', async () => {
    expect.assertions(0);
    const preHook = app => {
        app.use('/api/admin/', (req, res) =>
            res
                .status('401')
                .json(
                    new AuthenticationRequired({
                        path: '/api/admin/login',
                        type: 'custom',
                        message: 'You have to identify yourself.',
                    }),
                )
                .end(),
        );
    };
    const request = await setupAppWithCustomAuth(stores, preHook);
    return request.get('/api/admin/features').expect(401);
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
    const request = await setupAppWithCustomAuth(stores, preHook);

    // create toggle
    await request
        .post('/api/admin/features')
        .send({
            name: 'com.test.Username',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .expect(201);

    await request.get('/api/admin/events').expect(res => {
        expect(res.body.events[0].createdBy).toBe(email);
    });
});
