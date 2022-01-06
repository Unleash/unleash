import supertest from 'supertest';
import { createServices } from '../services';
import { createTestConfig } from '../../test/config/test-config';

import createStores from '../../test/fixtures/store';
import getApp from '../app';

test('should enable prometheus', async () => {
    expect.assertions(0);
    const stores = createStores();
    const config = createTestConfig();
    const services = createServices(stores, config);

    const app = await getApp(config, stores, services);

    const request = supertest(app);

    await request
        .get('/internal-backstage/prometheus')
        .expect('Content-Type', /text/)
        .expect(200);
    services.versionService.destroy();
    services.clientInstanceService.destroy();
    services.apiTokenService.destroy();
});
