import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import type { IUserStore } from '../../types';

let app: IUnleashTest;
let db: ITestDb;
let userStore: IUserStore;

const loginUser = (email: string) => {
    return app.request
        .post(`/auth/demo/login`)
        .send({
            email,
        })
        .expect(200);
};

beforeAll(async () => {
    db = await dbInit('user_settings', getLogger);
    userStore = db.stores.userStore;
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    userSettings: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    getLogger.setMuteError(false);
    await app.destroy();
    await db.destroy();
});

// beforeEach(async () => {
//     await db.stores.featureToggleStore.deleteAll();
//     await db.stores.userStore.deleteAll();
//     await db.stores.eventStore.deleteAll();
//     await db.stores.userStore.deleteAll();
// });

describe('UserSettingsController', () => {
    test('should return user settings', async () => {
        const { body: user } = await loginUser('test@example.com');
        // console.log({user})
        // await db.stores.userStore.setSettings(1, {
        //     'productivity-insights-email': 'true',
        // });
        const { body } = await app.request
            .put(`/api/admin/user/settings`)
            .send({
                key: 'productivity-insights-email',
                value: 'new_value',
            })
            .expect(204);

        const res = await app.request
            .get('/api/admin/user/settings')
            .expect(200);

        expect(res.body).toEqual({ 'productivity-insights-email': 'true' });
    });

    // test('should return empty object if no settings are available', async () => {
    //     const res = await app.request
    //         .get('/api/admin/user/settings')
    //         // .set('Authorization', `Bearer ${userId}`)
    //         .expect(200);

    //     expect(res.body).toEqual({});
    // });

    // describe('PUT /settings/:key', () => {
    //     const allowedKey = 'productivity-insights-email';

    //     test('should update user setting if key is valid', async () => {
    //         const res = await app.request
    //             .put(`/api/admin/user/settings/${allowedKey}`)
    //             // .set('Authorization', `Bearer ${userId}`)
    //             .send({ value: 'new_value' })
    //             .expect(204);

    //         expect(res.body).toEqual({});

    //         const updatedSetting =
    //             await db.stores.userStore.getSettings(userId);
    //         expect(updatedSetting.value).toEqual('new_value');
    //     });

    //     test('should return 400 for invalid setting key', async () => {
    //         const res = await app.request
    //             .put(`/api/admin/user/settings/invalid-key`)
    //             // .set('Authorization', `Bearer ${userId}`)
    //             .send({ value: 'some_value' })
    //             .expect(400);

    //         expect(res.body).toEqual({
    //             message: 'Invalid setting key',
    //         });
    //     });
    // });
});
