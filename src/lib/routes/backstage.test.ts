import supertest from 'supertest';
import { createServices } from '../services/index.js';
import { createTestConfig } from '../../test/config/test-config.js';

import createStores from '../../test/fixtures/store.js';
import getApp from '../app.js';
import MetricsMonitor from '../metrics.js';

test('should enable prometheus', async () => {
    const stores = createStores();
    const config = createTestConfig();
    const services = createServices(stores, config);

    await stores.userStore.insert({
        username: 'admin',
    });

    const app = await getApp(config, stores, services);
    const monitor = new MetricsMonitor();
    await monitor.startMonitoring(
        config,
        stores,
        'test',
        config.eventBus,
        services.instanceStatsService,
        services.schedulerService,
        // @ts-expect-error
        stores.db,
    );

    const request = supertest(app);

    const { status, headers, text } = await request.get(
        '/internal-backstage/prometheus',
    );
    expect(status).toBe(200);
    expect(headers['content-type']).toMatch(/text/);
    // extract line that starts with users_total
    const usersTotalLine = text
        .split('\n')
        .find((line) => line.startsWith('users_total'));

    expect(usersTotalLine).toBeDefined();
    expect(usersTotalLine).toMatch(/users_total 1/);
});
