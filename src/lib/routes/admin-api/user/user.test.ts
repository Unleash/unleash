import supertest from 'supertest';
import { createServices } from '../../../services/index.js';
import { createTestConfig } from '../../../../test/config/test-config.js';

import createStores from '../../../../test/fixtures/store.js';
import getApp from '../../../app.js';
import User from '../../../types/user.js';
import bcrypt from 'bcryptjs';

const currentUserData = { id: 1337, email: 'test@mail.com' };
const oldPassword = 'old-pass';

async function getSetup({
    withPassword = true,
}: {
    withPassword?: boolean;
} = {}) {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = createStores();
    const currentUser = await stores.userStore.insert(
        new User(currentUserData),
    );
    if (withPassword) {
        await stores.userStore.setPasswordHash(
            currentUser.id,
            await bcrypt.hash(oldPassword, 10),
            5,
        );
    }

    const config = createTestConfig({
        preHook: (a) => {
            a.use((req, _res, next) => {
                req.user = currentUser;
                // stub the session id the user is acting from
                req.sessionID = 'current-session';
                next();
            });
        },
        server: { baseUriPath: base },
    });
    const services = createServices(stores, config);
    const app = await getApp(config, stores, services);
    return {
        base,
        currentUser,
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
            expect(res.body.user.email).toBe(currentUserData.email);
        });
});
const owaspPassword = 't7GTx&$Y9pcsnxRv6';

test('should return current profile', async () => {
    expect.assertions(1);
    const { request, base } = await getSetup();

    return request
        .get(`${base}/api/admin/user/profile`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body).toMatchObject({
                canChangePassword: true,
                projects: [],
                groups: [],
                rootRole: { id: -1, name: 'Viewer', type: 'root' },
                subscriptions: ['productivity-report'],
                features: [],
            });
        });
});

test('should allow user to change password', async () => {
    const { request, base, currentUser, userStore } = await getSetup();
    await request
        .post(`${base}/api/admin/user/change-password`)
        .send({
            password: owaspPassword,
            confirmPassword: owaspPassword,
            oldPassword,
        })
        .expect(200);
    const updated = await userStore.get(currentUser.id);
    // @ts-expect-error
    expect(updated.passwordHash).toBeTruthy();
});

test('changing own password keeps the current session and terminates the others', async () => {
    const { request, base, currentUser, sessionStore } = await getSetup();
    await sessionStore.insertSession({
        sid: 'current-session',
        sess: { user: { id: currentUser.id } },
    });
    await sessionStore.insertSession({
        sid: 'other-device',
        sess: { user: { id: currentUser.id } },
    });

    await request
        .post(`${base}/api/admin/user/change-password`)
        .send({
            password: owaspPassword,
            confirmPassword: owaspPassword,
            oldPassword,
        })
        .expect(200);

    const remaining = await sessionStore.getSessionsForUser(currentUser.id);
    expect(remaining.map((session) => session.sid)).toEqual([
        'current-session',
    ]);
});

test('should not allow user to change password with incorrect old password', async () => {
    const { request, base } = await getSetup();
    await request
        .post(`${base}/api/admin/user/change-password`)
        .send({
            password: owaspPassword,
            confirmPassword: owaspPassword,
            oldPassword: 'incorrect',
        })
        .expect(401);
});

test('should not allow user without a local password to change password', async () => {
    const { request, base } = await getSetup({ withPassword: false });
    await request
        .post(`${base}/api/admin/user/change-password`)
        .send({
            password: owaspPassword,
            confirmPassword: owaspPassword,
            oldPassword,
        })
        .expect(401);
});

test('should report that user without a local password cannot change password', async () => {
    const { request, base } = await getSetup({ withPassword: false });

    return request
        .get(`${base}/api/admin/user/profile`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.canChangePassword).toBe(false);
        });
});

test('should not allow user to change password without providing old password', async () => {
    const { request, base } = await getSetup();
    await request
        .post(`${base}/api/admin/user/change-password`)
        .send({
            password: owaspPassword,
            confirmPassword: owaspPassword,
        })
        .expect(400);
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
