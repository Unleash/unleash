import createStores from '../../test/fixtures/store.js';
import { createTestConfig } from '../../test/config/test-config.js';
import { createServices } from '../services/index.js';
import getApp from '../app.js';
import supertest, { type Test } from 'supertest';
import permissions from '../../test/fixtures/permissions.js';
import { RoleName, RoleType } from '../types/model.js';
import type { IUnleashStores } from '../types/index.js';
import type TestAgent from 'supertest/lib/agent.d.ts';
import { vi } from 'vitest';

describe('Public Signup API', () => {
    async function getSetup() {
        const stores = createStores();
        const perms = permissions();
        const config = createTestConfig({
            preRouterHook: perms.hook,
        });

        stores.accessStore = {
            ...stores.accessStore,
            addUserToRole: vi.fn() as () => Promise<void>,
            removeRolesOfTypeForUser: vi.fn() as () => Promise<void>,
            getRolesForUserId: () => Promise.resolve([]),
            getRootRoleForUser: () =>
                Promise.resolve({
                    id: -1,
                    name: RoleName.VIEWER,
                    type: RoleType.ROOT,
                }),
        };

        const services = createServices(stores, config);
        const app = await getApp(config, stores, services);

        await stores.roleStore.create({
            name: RoleName.VIEWER,
            roleType: RoleType.ROOT,
            description: '',
        });

        await stores.roleStore.create({
            name: RoleName.ADMIN,
            roleType: RoleType.ROOT,
            description: '',
        });

        return {
            request: supertest(app),
            stores,
            perms,
        };
    }

    let stores: IUnleashStores;
    let request: TestAgent<Test>;

    const user = {
        username: 'some-username',
        email: 'someEmail@example.com',
        name: 'some-name',
        password: 'password',
    };

    beforeEach(async () => {
        const setup = await getSetup();
        stores = setup.stores;
        request = setup.request;
    });

    const expireAt = (addDays: number = 7): Date => {
        const now = new Date();
        now.setDate(now.getDate() + addDays);
        return now;
    };

    const createBody = () => ({
        name: 'some-name',
        expiresAt: expireAt(),
    });

    test('should create user and add to token', async () => {
        expect.assertions(3);
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });
        // @ts-expect-error - This method is available on our fake store, but not our real store
        stores.publicSignupTokenStore.create({
            name: 'some-name',
            expiresAt: expireAt(),
        });

        return request
            .post('/invite/some-secret/signup')
            .send(user)
            .expect(201)
            .expect(async (res) => {
                const count = await stores.userStore.count();
                expect(count).toBe(1);
                const eventCount = await stores.eventStore.count();
                expect(eventCount).toBe(2); //USER_CREATED && PUBLIC_SIGNUP_TOKEN_USER_ADDED
                expect(res.body.username).toBe(user.username);
            });
    });

    test('Should validate required fields', async () => {
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });
        // @ts-expect-error - We need more fields, but since this is a test. we get away with this call
        stores.publicSignupTokenStore.create({
            name: 'some-name',
            expiresAt: expireAt(),
        });

        await request
            .post('/invite/some-secret/signup')
            .send({ name: 'test' })
            .expect(400);

        await request
            .post('/invite/some-secret/signup')
            .send({ email: 'test@test.com' })
            .expect(400);

        await request
            .post('/invite/some-secret/signup')
            .send({ ...user, rootRole: 1 })
            .expect(400);

        await request.post('/invite/some-secret/signup').send({}).expect(400);
    });

    test('should not be able to send root role in signup request body', async () => {
        const appName = '123!23';

        await stores.clientApplicationsStore.upsert({ appName });
        // @ts-expect-error - We need more fields, but since this is a test. we get away with this call
        await stores.publicSignupTokenStore.insert({
            name: 'some-name',
            expiresAt: expireAt(),
        });

        const roles = await stores.roleStore.getAll();
        const adminId = roles.find((role) => role.name === RoleName.ADMIN)!.id;

        return request
            .post('/invite/some-secret/signup')
            .send({ ...user, rootRole: adminId })
            .expect(400);
    });

    test('should not allow a user to register with expired token', async () => {
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });
        // @ts-expect-error - This method is available on our fake store, but not our real store
        stores.publicSignupTokenStore.create({
            name: 'some-name',
            expiresAt: expireAt(-1),
        });

        return request
            .post('/invite/some-secret/signup')
            .send(user)
            .expect(400);
    });

    test('should not allow a user to register disabled token', async () => {
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });
        // @ts-expect-error - This method is available on our fake store, but not our real store
        stores.publicSignupTokenStore.create({
            name: 'some-name',
            expiresAt: expireAt(),
        });
        stores.publicSignupTokenStore.update('some-secret', { enabled: false });

        return request
            .post('/invite/some-secret/signup')
            .send(user)
            .expect(400);
    });

    test('should return 200 if token is valid', async () => {
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });
        // Create a token
        const res = await request
            .post('/api/admin/invite-link/tokens')
            .send(createBody())
            .expect(201);
        const { secret } = res.body;

        return request.get(`/invite/${secret}/validate`).expect(200);
    });

    test('should return 400 if token is invalid', async () => {
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });

        return request.get('/invite/some-invalid-secret/validate').expect(400);
    });
});
