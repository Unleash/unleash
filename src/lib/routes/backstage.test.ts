import supertest from 'supertest';
import { createServices } from '../services/index.js';
import { createTestConfig } from '../../test/config/test-config.js';

import createStores from '../../test/fixtures/store.js';
import getApp from '../app.js';

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
});
