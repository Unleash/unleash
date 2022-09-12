import createStores from '../../../test/fixtures/store';
import { createTestConfig } from '../../../test/config/test-config';
import { createServices } from '../../services';
import getApp from '../../app';
import supertest from 'supertest';
import permissions from '../../../test/fixtures/permissions';
import { RoleName, RoleType } from '../../types/model';

async function getSetup() {
    const stores = createStores();
    const perms = permissions();
    const config = createTestConfig({
        preRouterHook: perms.hook,
        flagResolver: {
            isEnabled: jest.fn().mockResolvedValue(true),
            getAll: jest.fn(),
        },
    });

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
            expect(token.expiresAt).toBe(bodyCreate.expiresAt);
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
            expect(token.expiresAt).toBe(bodyCreate.expiresAt);
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
            const tokens = res.body;
            expect(tokens[0].name).toBe('some-name');
        });
});
