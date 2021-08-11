import supertest from 'supertest';
import { EventEmitter } from 'events';
import { createServices } from '../../services';
import { createTestConfig } from '../../../test/config/test-config';

import createStores from '../../../test/fixtures/store';

import getApp from '../../app';

const eventBus = new EventEmitter();

function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = createStores();
    const config = createTestConfig({
        server: { baseUriPath: base },
    });
    const services = createServices(stores, config);
    const app = getApp(config, stores, services, eventBus);

    return { base, eventStore: stores.eventStore, request: supertest(app) };
}

test('should get empty events list via admin', () => {
    expect.assertions(1);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/events`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.events.length === 0).toBe(true);
        });
});
