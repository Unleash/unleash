import supertest from 'supertest';
import { createTestConfig } from '../../../test/config/test-config';
import createStores from '../../../test/fixtures/store';
import getLogger from '../../../test/fixtures/no-logger';
import getApp from '../../app';
import { createServices } from '../../services';

async function getSetup() {
    const stores = createStores();
    const config = createTestConfig();
    const services = createServices(stores, config);
    const app = await getApp(config, stores, services);

    return {
        request: supertest(app),
        stores,
        destroy: () => {
            services.versionService.destroy();
            services.clientInstanceService.destroy();
            services.apiTokenService.destroy();
        },
    };
}
let request;
let destroy;
beforeEach(async () => {
    const setup = await getSetup();
    request = setup.request;
    destroy = setup.destroy;
});
afterEach(() => {
    destroy();
    getLogger.setMuteError(false);
});

test('should register client', () => {
    expect.assertions(0);
    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            instanceId: 'test',
            strategies: ['default'],
            sdkVersion: 'unleash-client-test:1.2',
            started: Date.now(),
            interval: 10,
        })
        .expect(202);
});

test('should register client without sdkVersion', () => {
    expect.assertions(0);
    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            instanceId: 'test',
            strategies: ['default'],
            started: Date.now(),
            interval: 10,
        })
        .expect(202);
});

test('should require appName field', () => {
    expect.assertions(0);
    return request
        .post('/api/client/register')
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should require strategies field', () => {
    expect.assertions(0);
    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            instanceId: 'test',
            // strategies: ['default'],
            started: Date.now(),
            interval: 10,
        })
        .expect(400);
});

test('should allow an no instanceId field', () => {
    expect.assertions(0);
    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            strategies: ['default'],
            started: Date.now(),
            interval: 10,
        })
        .expect(202);
});

test('should allow an empty instanceId field', () => {
    expect.assertions(0);
    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            instanceId: '',
            strategies: ['default'],
            started: Date.now(),
            interval: 10,
        })
        .expect(202);
});
