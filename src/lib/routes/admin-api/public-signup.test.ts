import createStores from '../../../test/fixtures/store';
import { createTestConfig } from '../../../test/config/test-config';
import { createServices } from '../../services';
import getApp from '../../app';
import supertest from 'supertest';
import permissions from '../../../test/fixtures/permissions';
import { RoleName, RoleType } from '../../types/model';
import { CreateUserSchema } from '../../openapi/spec/create-user-schema';

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
                services.apiTokenService.destroy();
            },
        };
    }

    let stores;
    let request;
    let destroy;

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
        expect.assertions(2);
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });

        const bodyCreate = createBody();

        return request
            .post('/api/admin/public-signup/token')
            .send(bodyCreate)
            .expect(201)
            .expect((res) => {
                const token = res.body;
                expect(token.name).toBe(bodyCreate.name);
                expect(token.expiresAt).toBe(
                    bodyCreate.expiresAt.toISOString(),
                );
            });
    });

    test('should create a token', async () => {
        expect.assertions(2);
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });
        stores.roleStore.create({ name: RoleName.VIEWER });
        const bodyCreate = createBody();

        return request
            .post('/api/admin/public-signup/token')
            .send(bodyCreate)
            .expect(201)
            .expect((res) => {
                const token = res.body;
                expect(token.name).toBe(bodyCreate.name);
                expect(token.expiresAt).toBe(
                    bodyCreate.expiresAt.toISOString(),
                );
            });
    });

    test('should get All', async () => {
        expect.assertions(1);
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });
        stores.publicSignupTokenStore.create({
            name: 'some-name',
            expiresAt: expireAt(),
        });

        return request
            .get('/api/admin/public-signup/tokens')
            .expect(200)
            .expect((res) => {
                const { tokens } = res.body;
                expect(tokens[0].name).toBe('some-name');
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
            .get('/api/admin/public-signup/token/some-secret')
            .expect(200)
            .expect((res) => {
                const token = res.body;
                expect(token.name).toBe('some-name');
            });
    });

    test('should create user and add to token', async () => {
        expect.assertions(1);
        const appName = '123!23';

        stores.clientApplicationsStore.upsert({ appName });
        stores.publicSignupTokenStore.create({
            name: 'some-name',
            expiresAt: expireAt(),
        });

        const user: CreateUserSchema = {
            username: 'some-username',
            email: 'someEmail@example.com',
            name: 'some-name',
            password: null,
            rootRole: 1,
            sendEmail: false,
        };

        return request
            .post('/api/admin/public-signup/token/some-secret/signup')
            .send(user)
            .expect(200)
            .expect(async () => {
                const count = await stores.userStore.count();
                expect(count).toBe(1);
            });
    });
});
