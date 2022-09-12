import createStores from '../../../test/fixtures/store';
import { createTestConfig } from '../../../test/config/test-config';
import { createServices } from '../../services';
import getApp from '../../app';
import supertest from 'supertest';
import permissions from '../../../test/fixtures/permissions';

async function getSetup() {
    const stores = createStores();
    const perms = permissions();
    const config = createTestConfig({
        preRouterHook: perms.hook,
    });
    const services = createServices(stores, config);
    const app = await getApp(config, stores, services);

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

const createBody = () => ({
    name: 'some-name',
    expiresAt: () => {
        let now = new Date();
        now.setDate(now.getDate() + 7);
        return now.toISOString();
    },
});

test('should return the provided input arguments as part of the response', async () => {
    expect.assertions(2);
    const appName = '123!23';

    stores.clientApplicationsStore.upsert({ appName });
    const bodyCreate = createBody();
    return request
        .post('/api/admin/public-signup/token')
        .send(bodyCreate)
        .expect(200)
        .expect((res) => {
            const token = res.body;
            expect(token.name).toBe(bodyCreate.name);
            expect(token.expiresAt).toBe(bodyCreate.expiresAt);
        });
});
