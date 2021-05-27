'use strict';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const permissions = require('../../../test/fixtures/permissions');
const getApp = require('../../app');
const { createTestConfig } = require('../../../test/config/test-config');
const { createServices } = require('../../services');

const eventBus = new EventEmitter();
let base;
let archiveStore;
let eventStore;
let featureToggleService;
let destroy;
let request;

function getSetup() {
    const randomBase = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores();
    const perms = permissions();
    const config = createTestConfig({
        server: { baseUriPath: randomBase },
        preHook: perms.hook,
    });
    const services = createServices(stores, config);
    const app = getApp(config, stores, services, eventBus);

    return {
        base: randomBase,
        perms,
        archiveStore: stores.featureToggleStore,
        eventStore: stores.eventStore,
        featureToggleService: services.featureToggleService,
        request: supertest(app),
        destroy: () => {
            services.versionService.destroy();
            services.clientMetricsService.destroy();
            services.apiTokenService.destroy();
        },
    };
}
beforeEach(() => {
    const setup = getSetup();
    base = setup.base;
    destroy = setup.destroy;
    request = setup.request;
    archiveStore = setup.archiveStore;
    eventStore = setup.eventStore;
    featureToggleService = setup.featureToggleService;
});

afterEach(() => {
    destroy();
});
test('should get empty getFeatures via admin', () => {
    expect.assertions(1);
    return request
        .get(`${base}/api/admin/archive/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length === 0).toBe(true);
        });
});

test('should be allowed to reuse deleted toggle name', async () => {
    expect.assertions(0);
    await archiveStore.createFeature({
        name: 'ts.really.delete',
        strategies: [{ name: 'default' }],
    });
    await request
        .delete(`${base}/api/admin/archive/ts.really.delete`)
        .expect(200);
    return request
        .post(`${base}/api/admin/features/validate`)
        .send({ name: 'ts.really.delete' })
        .set('Content-Type', 'application/json')
        .expect(409);
});

test('should get archived toggles via admin', () => {
    expect.assertions(1);
    archiveStore.addArchivedFeature({
        name: 'test1',
        strategies: [{ name: 'default' }],
    });
    archiveStore.addArchivedFeature({
        name: 'test2',
        strategies: [{ name: 'default' }],
    });
    return request
        .get(`${base}/api/admin/archive/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length === 2).toBe(true);
        });
});

test('should revive toggle', () => {
    expect.assertions(0);
    const name = 'name1';
    archiveStore.addArchivedFeature({
        name,
        strategies: [{ name: 'default' }],
    });

    return request
        .post(`${base}/api/admin/archive/revive/${name}`)
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('should create event when reviving toggle', async () => {
    expect.assertions(6);
    const name = 'name1';

    await featureToggleService.addArchivedFeature({
        name,
        strategies: [{ name: 'default' }],
    });

    await featureToggleService.addTag(
        name,
        {
            type: 'simple',
            value: 'tag',
        },
        'test@test.com',
    );

    await request
        .post(`${base}/api/admin/archive/revive/${name}`)
        .set('Content-Type', 'application/json');

    const events = await eventStore.getEvents();
    expect(events.length).toBe(3);
    expect(events[2].type).toBe('feature-revived');
    expect(events[2].data.name).toBe(name);
    expect(events[2].createdBy).toBe('unknown');
    expect(events[2].tags[0].type).toBe('simple');
    expect(events[2].tags[0].value).toBe('tag');
});

test('should require toggle name when reviving', () => {
    expect.assertions(0);
    return request.post(`${base}/api/admin/archive/revive/`).expect(404);
});
