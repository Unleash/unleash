import createStores from '../../../test/fixtures/store.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import { createServices } from '../../services/index.js';
import getApp from '../../app.js';
import supertest, { type Test } from 'supertest';
import permissions from '../../../test/fixtures/permissions.js';
import { RoleName, RoleType } from '../../types/model.js';
import type { IUnleashStores } from '../../types/index.js';
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
        };

        const services = createServices(stores, config);
        const app = await getApp(config, stores, services);

        await stores.roleStore.create({
            name: RoleName.VIEWER,
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

    test('should create a token', async () => {
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });
        stores.roleStore.create({
            description: '',
            roleType: '',
            name: RoleName.VIEWER,
        });
        const bodyCreate = createBody();

        const res = await request
            .post('/api/admin/invite-link/tokens')
            .send(bodyCreate)
            .expect(201);
        const token = res.body;
        expect(token.name).toBe(bodyCreate.name);
        expect(token.secret).not.toBeNull();
        expect(token.expiresAt).toBe(bodyCreate.expiresAt.toISOString());
        const eventCount = await stores.eventStore.count();
        expect(eventCount).toBe(1); //PUBLIC_SIGNUP_TOKEN_CREATED
    });

    test('should get All', async () => {
        expect.assertions(2);
        const appName = '123!23';

        await stores.clientApplicationsStore.upsert({ appName });
        await stores.publicSignupTokenStore.insert({
            roleId: 0,
            secret: '',
            url: '',
            name: 'some-name',
            expiresAt: expireAt(),
            createdBy: 'johnDoe',
        });

        return request
            .get('/api/admin/invite-link/tokens')
            .expect(200)
            .expect((res) => {
                const { tokens } = res.body;
                expect(tokens[0].name).toBe('some-name');
                expect(tokens[0].createdBy).toBe('johnDoe');
            });
    });

    test('should get token', async () => {
        expect.assertions(1);
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });
        // @ts-expect-error - hacked in via fake store
        stores.publicSignupTokenStore.create({
            name: 'some-name',
            expiresAt: expireAt(),
        });

        return request
            .get('/api/admin/invite-link/tokens/some-secret')
            .expect(200)
            .expect((res) => {
                const token = res.body;
                expect(token.name).toBe('some-name');
            });
    });

    test('should expire token', async () => {
        expect.assertions(2);
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });
        // @ts-expect-error - hacked in via fake store
        stores.publicSignupTokenStore.create({
            name: 'some-name',
            expiresAt: expireAt(),
        });

        const expireNow = expireAt(0);

        return request
            .put('/api/admin/invite-link/tokens/some-secret')
            .send({ expiresAt: expireNow.toISOString() })
            .expect(200)
            .expect(async (res) => {
                const token = res.body;
                expect(token.expiresAt).toBe(expireNow.toISOString());
                const eventCount = await stores.eventStore.count();
                expect(eventCount).toBe(1); // PUBLIC_SIGNUP_TOKEN_TOKEN_UPDATED
            });
    });

    test('should disable the token', async () => {
        expect.assertions(1);
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });
        // @ts-expect-error - hacked in via fake store
        stores.publicSignupTokenStore.create({
            name: 'some-name',
            expiresAt: expireAt(),
        });

        return request
            .put('/api/admin/invite-link/tokens/some-secret')
            .send({ enabled: false })
            .expect(200)
            .expect(async (res) => {
                const token = res.body;
                expect(token.enabled).toBe(false);
            });
    });

    test('should not allow a user to register disabled token', async () => {
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });
        // @ts-expect-error - hacked in via fake store
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
});
