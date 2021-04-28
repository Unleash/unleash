import test, { before } from 'ava';

import dbInit from './helpers/database-init';
import { setupAppWithCustomAuth } from './helpers/test-helper';

let db;
let stores;

before(async t => {
    db = await dbInit('custom_auth_serial');
    stores = db.stores;
});

test('Using custom auth type without defining custom middleware causes default DENY ALL policy to take effect', async t => {
    t.plan(1);
    const request = await setupAppWithCustomAuth(stores, undefined);
    await request
        .get('/api/admin/features')
        .expect(401)
        .expect(res => {
            t.is(
                res.body.error,
                'You have to configure a custom authentication middleware. Read https://docs.getunleash.io/docs/deploy/configuring_unleash for more details',
            );
        });
});

test('If actually configuring a custom middleware should configure the middleware', async t => {
    t.plan(0);
    const request = await setupAppWithCustomAuth(stores, () => {});
    return request.get('/api/admin/features').expect(200);
});
