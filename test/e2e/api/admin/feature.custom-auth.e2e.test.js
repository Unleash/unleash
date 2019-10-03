'use strict';

const test = require('ava');
const { setupAppWithCustomAuth } = require('./../../helpers/test-helper');
const AuthenticationRequired = require('./../../../../lib/authentication-required');
const User = require('./../../../../lib/user');

const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let stores;

test.before(async () => {
    stores = await dbInit('feature_api_custom_auth', getLogger);
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('should require authenticated user', async t => {
    t.plan(0);
    const preHook = app => {
        app.use('/api/admin/', (req, res) =>
            res
                .status('401')
                .json(
                    new AuthenticationRequired({
                        path: '/api/admin/login',
                        type: 'custom',
                        message: `You have to identify yourself.`,
                    })
                )
                .end()
        );
    };
    const request = await setupAppWithCustomAuth(stores, preHook);
    return request.get('/api/admin/features').expect(401);
});

test.serial('creates new feature toggle with createdBy', async t => {
    t.plan(1);
    const user = new User({ email: 'custom-user@mail.com' });

    const preHook = app => {
        app.use('/api/admin/', (req, res, next) => {
            req.user = user;
            next();
        });
    };
    const request = await setupAppWithCustomAuth(stores, preHook);

    // create toggle
    await request.post('/api/admin/features').send({
        name: 'com.test.Username',
        enabled: false,
        strategies: [{ name: 'default' }],
    });

    await request.get('/api/admin/events').expect(res => {
        t.true(res.body.events[0].createdBy === user.email);
    });
});
