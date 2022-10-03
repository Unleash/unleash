import createStores from '../../../test/fixtures/store';
import { createTestConfig } from '../../../test/config/test-config';
import { createServices } from '../../services';
import getApp from '../../app';
import supertest from 'supertest';
import permissions from '../../../test/fixtures/permissions';
import { RoleName, RoleType } from '../../types/model';

describe('Public Signup API', () => {
    async function getSetup() {
        const stores = createStores();
        const perms = permissions();
        const config = createTestConfig({
            preRouterHook: perms.hook,
        });

        config.flagResolver = {
            isEnabled: jest.fn().mockResolvedValue(true),
            getAll: jest.fn(),
        };

        stores.accessStore = {
            ...stores.accessStore,
            addUserToRole: jest.fn(),
            removeRolesOfTypeForUser: jest.fn(),
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
            destroy: () => {
                services.versionService.destroy();
                services.clientInstanceService.destroy();
                services.publicSignupTokenService.destroy();
            },
        };
    }

    let stores;
    let request;
    let destroy;

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
        destroy = setup.destroy;
    });

    afterEach(() => {
        destroy();
    });
    const expireAt = (addDays: number = 7): Date => {
        let now = new Date();
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
        stores.roleStore.create({ name: RoleName.VIEWER });
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

        stores.clientApplicationsStore.upsert({ appName });
        stores.publicSignupTokenStore.insert({
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
