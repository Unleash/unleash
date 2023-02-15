import supertest from 'supertest';
import { createServices } from '../../services';
import { createTestConfig } from '../../../test/config/test-config';

import createStores from '../../../test/fixtures/store';

import getApp from '../../app';
import { FeatureCreatedEvent } from '../../types/events';

async function getSetup(anonymise: boolean = false) {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = createStores();
    const config = createTestConfig({
        server: { baseUriPath: base },
        experimental: { flags: { anonymiseEventLog: anonymise } },
    });
    const services = createServices(stores, config);
    const app = await getApp(config, stores, services);

    return { base, eventStore: stores.eventStore, request: supertest(app) };
}

test('should get empty events list via admin', async () => {
    expect.assertions(1);
    const { request, base } = await getSetup();
    return request
        .get(`${base}/api/admin/events`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.events.length === 0).toBe(true);
        });
});

test('should get events list via admin', async () => {
    const { request, base, eventStore } = await getSetup();
    eventStore.store(
        new FeatureCreatedEvent({
            createdBy: 'some@email.com',
            data: { name: 'test', project: 'default' },
            featureName: 'test',
            project: 'default',
            tags: [],
        }),
    );
    const { body } = await request
        .get(`${base}/api/admin/events`)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.events.length).toBe(1);
    expect(body.events[0].createdBy).toBe('some@email.com');
});

test('should anonymise events list via admin', async () => {
    const { request, base, eventStore } = await getSetup(true);
    eventStore.store(
        new FeatureCreatedEvent({
            createdBy: 'some@email.com',
            data: { name: 'test', project: 'default' },
            featureName: 'test',
            project: 'default',
            tags: [],
        }),
    );
    const { body } = await request
        .get(`${base}/api/admin/events`)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.events.length).toBe(1);
    expect(body.events[0].createdBy).toBe('676212ff7@unleash.run');
});
