'use strict';;
import { createServices } from '../../services';
import { createTestConfig } from '../../../test/config/test-config';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const getApp = require('../../app');
const User = require('../../user');

const eventBus = new EventEmitter();

const currentUser = new User({ email: 'test@mail.com' });

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    stores.userStore.insert(currentUser);

    const config = createTestConfig({
        preHook: a => {
            a.use((req, res, next) => {
                req.user = currentUser;
                next();
            });
        },
        server: { baseUriPath: base },
    });
    const services = createServices(stores, config);
    const app = getApp(config, stores, services, eventBus);
    return {
        base,
        userStore: stores.userStore,
        request: supertest(app),
    };
}

test('should return current user', () => {
    expect.assertions(1);
    const { request, base } = getSetup();

    return request
        .get(`${base}/api/admin/user`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            expect(res.body.user.email).toBe(currentUser.email);
        });
});
const owaspPassword = 't7GTx&$Y9pcsnxRv6';

test('should allow user to change password', async () => {
    expect.assertions(2);
    const { request, base, userStore } = getSetup();
    const before = await userStore.get(currentUser);
    expect(before.passwordHash).toBeFalsy();
    await request
        .post(`${base}/api/admin/user/change-password`)
        .send({ password: owaspPassword, confirmPassword: owaspPassword })
        .expect(200);
    const updated = await userStore.get(currentUser);
    expect(updated.passwordHash).toBeTruthy();
});

test('should deny if password and confirmPassword are not equal', async () => {
    expect.assertions(0);
    const { request, base } = getSetup();
    return request
        .post(`${base}/api/admin/user/change-password`)
        .send({ password: owaspPassword, confirmPassword: 'somethingelse' })
        .expect(400);
});

test('should deny if password does not fulfill owasp criteria', async () => {
    expect.assertions(0);
    const { request, base } = getSetup();
    return request
        .post(`${base}/api/admin/user/change-password`)
        .send({ password: 'hunter123', confirmPassword: 'hunter123' })
        .expect(400);
});
