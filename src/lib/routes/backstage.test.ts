import supertest from 'supertest';
import { EventEmitter } from 'events';
import { createServices } from '../services';
import { createTestConfig } from '../../test/config/test-config';

import createStores from '../../test/fixtures/store';
import getApp from '../app';

const eventBus = new EventEmitter();

test('should enable prometheus', async () => {
    expect.assertions(0);
    const stores = createStores();
    const config = createTestConfig();
    const services = createServices(stores, config);

    const app = getApp(config, stores, services, eventBus);

    const request = supertest(app);

    await request
        .get('/internal-backstage/prometheus')
        .expect('Content-Type', /text/)
        .expect(200);
    services.versionService.destroy();
    services.clientMetricsService.destroy();
    services.apiTokenService.destroy();
});
