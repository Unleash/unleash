import dbInit from './helpers/database-init';
import { setupAppWithCustomAuth } from './helpers/test-helper';

let db;

beforeAll(async () => {
    db = await dbInit('custom_auth_serial');
});

test('Using custom auth type without defining custom middleware causes default DENY ALL policy to take effect', async () => {
    jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());
    const { request, destroy } = await setupAppWithCustomAuth(db, undefined);
    await request
        .get('/api/admin/features')
        .expect(401)
        .expect((res) => {
            expect(res.body.error).toBe(
                'You have to configure a custom authentication middleware. Read https://docs.getunleash.io/docs/deploy/configuring_unleash for more details',
            );
        });
    await destroy();
});

test('If actually configuring a custom middleware should configure the middleware', async () => {
    expect.assertions(0);
    const { request, destroy } = await setupAppWithCustomAuth(db, () => {});
    await request.get('/api/admin/features').expect(200);
    await destroy();
});
