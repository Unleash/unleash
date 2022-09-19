import supertest from 'supertest';
import { createServices } from '../../../services';
import { createTestConfig } from '../../../../test/config/test-config';

import createStores from '../../../../test/fixtures/store';
import getApp from '../../../app';
import User from '../../../types/user';

const currentUser = new User({ id: 1337, email: 'test@mail.com' });

async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = createStores();
    await stores.userStore.insert(currentUser);

    const config = createTestConfig({
        preHook: (a) => {
            a.use((req, res, next) => {
                req.user = currentUser;
                next();
            });
        },
        server: { baseUriPath: base },
    });
    const services = createServices(stores, config);
    const app = await getApp(config, stores, services);
    return {
        base,
        userStore: stores.userStore,
        sessionStore: stores.sessionStore,
        request: supertest(app),
    };
}

test('should return current user', async () => {
    expect.assertions(1);
    const { request, base } = await getSetup();

    return request
        .get(`${base}/api/admin/user`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.user.email).toBe(currentUser.email);
        });
});
const owaspPassword = 't7GTx&$Y9pcsnxRv6';

test('should allow user to change password', async () => {
    expect.assertions(2);
    const { request, base, userStore } = await getSetup();
    const before = await userStore.get(currentUser.id);
    // @ts-ignore
    expect(before.passwordHash).toBeFalsy();
    await request
        .post(`${base}/api/admin/user/change-password`)
        .send({ password: owaspPassword, confirmPassword: owaspPassword })
        .expect(200);
    const updated = await userStore.get(currentUser.id);
    // @ts-ignore
    expect(updated.passwordHash).toBeTruthy();
});

test('should deny if password and confirmPassword are not equal', async () => {
    expect.assertions(0);
    const { request, base } = await getSetup();
    return request
        .post(`${base}/api/admin/user/change-password`)
        .send({ password: owaspPassword, confirmPassword: 'somethingelse' })
        .expect(400);
});

test('should deny if password does not fulfill owasp criteria', async () => {
    expect.assertions(0);
    const { request, base } = await getSetup();
    return request
        .post(`${base}/api/admin/user/change-password`)
        .send({ password: 'hunter123', confirmPassword: 'hunter123' })
        .expect(400);
});
