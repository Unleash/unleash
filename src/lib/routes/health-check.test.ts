import supertest, { type Test } from 'supertest';
import { createServices } from '../services/index.js';
import { createTestConfig } from '../../test/config/test-config.js';

import createStores from '../../test/fixtures/store.js';
import getLogger from '../../test/fixtures/no-logger.js';
import getApp from '../app.js';
import type TestAgent from 'supertest/lib/agent.d.ts';

async function getSetup() {
    const stores = createStores();
    const config = createTestConfig();
    const services = createServices(stores, config);
    const app = await getApp(config, stores, services);

    return {
        request: supertest(app),
        stores,
    };
}
let request: TestAgent<Test>;
beforeEach(async () => {
    const setup = await getSetup();
    request = setup.request;
});

afterEach(() => {
    getLogger.setMuteError(false);
});

test('should give 200 when healthy', async () => {
    await request.get('/health').expect(200);
});

test('should give health=GOOD when healthy', async () => {
    expect.assertions(2);
    await request
        .get('/health')
        .expect(200)
        .expect((res) => {
            expect(res.status).toBe(200);
            expect(res.body.health).toBe('GOOD');
        });
});
