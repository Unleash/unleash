import supertest, { type Test } from 'supertest';
import { createTestConfig } from '../../../../test/config/test-config';
import createStores from '../../../../test/fixtures/store';
import getLogger from '../../../../test/fixtures/no-logger';
import getApp from '../../../app';
import { createServices } from '../../../services';
import type TestAgent from 'supertest/lib/agent';

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

test('Includes an X-Unleash-Version header in the response', () => {
    return request
        .post('/api/client/register')
        .send({
            appName: 'demo',
            instanceId: '',
            strategies: ['default'],
            started: Date.now(),
            interval: 10,
        })
        .expect(202)
        .expect((res) => {
            expect(res.headers['x-unleash-version']).toBeTruthy();
        });
});
