'use strict';;
import { createTestConfig } from '../../../test/config/test-config';

const supertest = require('supertest');
const { EventEmitter } = require('events');
const store = require('../../../test/fixtures/store');
const { createServices } = require('../../services');
const permissions = require('../../../test/fixtures/permissions');
const getLogger = require('../../../test/fixtures/no-logger');
const getApp = require('../../app');

const eventBus = new EventEmitter();

function getSetup(databaseIsUp = true) {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = store.createStores(databaseIsUp);
    const perms = permissions();
    const config = createTestConfig({
        server: { baseUriPath: base },
        preHook: perms.hook,
    });
    const services = createServices(stores, config);
    const app = getApp(config, stores, services, eventBus);

    return {
        base,
        perms,
        featureToggleStore: stores.featureToggleStore,
        eventStore: stores.eventStore,
        request: supertest(app),
    };
}

test('should get empty getFeatures via admin', () => {
    expect.assertions(1);
    const { request, base } = getSetup();
    return request
        .get(`${base}/api/admin/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length === 0).toBe(true);
        });
});

test('should get one getFeature', () => {
    expect.assertions(1);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.createFeature({
        name: 'test_',
        strategies: [{ name: 'default_' }],
    });

    return request
        .get(`${base}/api/admin/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length === 1).toBe(true);
        });
});

test('should add version numbers for /features', () => {
    expect.assertions(1);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.createFeature({
        name: 'test2',
        strategies: [{ name: 'default' }],
    });

    return request
        .get(`${base}/api/admin/features`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.version === 1).toBe(true);
        });
});

test('should require at least one strategy when creating a feature toggle', () => {
    expect.assertions(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/features`)
        .send({ name: 'sample.missing.strategy' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should be allowed to use new toggle name', () => {
    expect.assertions(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/features/validate`)
        .send({ name: 'new.name' })
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('should get unsupported media-type when posting as form-url-encoded', () => {
    expect.assertions(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/features`)
        .type('form')
        .send({ name: 'new.name' })
        .send({ enabled: true })
        .send({ strategies: [{ name: 'default' }] })
        .expect(415);
});

test('should be allowed to have variants="null"', () => {
    expect.assertions(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/features`)
        .send({
            name: 'new.name.null',
            enabled: false,
            strategies: [{ name: 'default' }],
            variants: null,
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('should not be allowed to reuse active toggle name', () => {
    expect.assertions(1);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.createFeature({
        name: 'ts',
        strategies: [{ name: 'default' }],
    });

    return request
        .post(`${base}/api/admin/features/validate`)
        .send({ name: 'ts' })
        .set('Content-Type', 'application/json')
        .expect(409)
        .expect(res => {
            expect(res.body.details[0].message).toBe('A toggle with that name already exists');
        });
});

test('should not be allowed to reuse archived toggle name', () => {
    expect.assertions(1);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.addArchivedFeature({
        name: 'ts.archived',
        strategies: [{ name: 'default' }],
    });

    return request
        .post(`${base}/api/admin/features/validate`)
        .send({ name: 'ts.archived' })
        .set('Content-Type', 'application/json')
        .expect(409)
        .expect(res => {
            expect(res.body.details[0].message).toBe('An archived toggle with that name already exists');
        });
});

test('should require at least one strategy when updating a feature toggle', () => {
    expect.assertions(0);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.createFeature({
        name: 'ts',
        strategies: [{ name: 'default' }],
    });

    return request
        .put(`${base}/api/admin/features/ts`)
        .send({ name: 'ts' })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('updating a feature toggle also requires application/json as content-type', () => {
    expect.assertions(0);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.createFeature({
        name: 'ts',
        strategies: [{ name: 'default' }],
    });

    return request
        .put(`${base}/api/admin/features/ts`)
        .type('form')
        .send({ name: 'ts' })
        .send({ strategies: [{ name: 'default' }] })
        .expect(415);
});

test('valid feature names should pass validation', () => {
    expect.assertions(0);
    const { request, base } = getSetup();

    const validNames = [
        'com.example',
        'com.exampleFeature',
        'com.example-company.feature',
        'com.example-company.exampleFeature',
        '123',
        'com.example-company.someFeature.123',
    ];

    return Promise.all(
        validNames.map(name =>
            request
                .post(`${base}/api/admin/features`)
                .send({
                    name,
                    enabled: false,
                    strategies: [{ name: 'default' }],
                })
                .set('Content-Type', 'application/json')
                .expect(201),
        ),
    );
});

test('invalid feature names should not pass validation', () => {
    expect.assertions(0);
    const { request, base } = getSetup();

    const invalidNames = [
        'some example',
        'some$example',
        'me&me',
        '   ',
        'o2%ae',
    ];

    return Promise.all(
        invalidNames.map(name =>
            request
                .post(`${base}/api/admin/features`)
                .send({
                    name,
                    enabled: false,
                    strategies: [{ name: 'default' }],
                })
                .set('Content-Type', 'application/json')
                .expect(400),
        ),
    );
});

// Make sure current UI works. Should align on joi errors in future.
test('invalid feature names should have error msg', () => {
    expect.assertions(1);
    const { request, base } = getSetup();

    const name = 'ØÆ`';

    return request
        .post(`${base}/api/admin/features`)
        .send({
            name,
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect(res => {
            expect(res.body.details[0].message === '"name" must be URL friendly').toBe(true);
        });
});

test('should not allow variants with same name when creating feature flag', () => {
    expect.assertions(0);
    const { request, base } = getSetup();

    return request
        .post(`${base}/api/admin/features`)
        .send({
            name: 't.variant',
            enabled: true,
            strategies: [{ name: 'default' }],
            variants: [
                { name: 'variant1', weight: 50 },
                { name: 'variant1', weight: 50 },
            ],
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should not allow variants with same name when updating feature flag', () => {
    expect.assertions(0);
    const { request, featureToggleStore, base } = getSetup();

    featureToggleStore.createFeature({
        name: 'ts',
        strategies: [{ name: 'default' }],
    });

    return request
        .put(`${base}/api/admin/features/ts`)
        .send({
            name: 'ts',
            strategies: [{ name: 'default' }],
            variants: [{ name: 'variant1' }, { name: 'variant1' }],
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test('should toggle on', () => {
    expect.assertions(1);
    const { request, featureToggleStore, base } = getSetup();

    featureToggleStore.createFeature({
        name: 'toggle.disabled',
        enabled: false,
        strategies: [{ name: 'default' }],
    });

    return request
        .post(`${base}/api/admin/features/toggle.disabled/toggle/on`)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.enabled === true).toBe(true);
        });
});

test('should toggle off', () => {
    expect.assertions(1);
    const { request, featureToggleStore, base } = getSetup();

    featureToggleStore.createFeature({
        name: 'toggle.enabled',
        enabled: true,
        strategies: [{ name: 'default' }],
    });

    return request
        .post(`${base}/api/admin/features/toggle.enabled/toggle/off`)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.enabled === false).toBe(true);
        });
});

test('should toggle', () => {
    expect.assertions(1);
    const { request, featureToggleStore, base } = getSetup();

    featureToggleStore.createFeature({
        name: 'toggle.disabled',
        enabled: false,
        strategies: [{ name: 'default' }],
    });

    return request
        .post(`${base}/api/admin/features/toggle.disabled/toggle`)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.enabled === true).toBe(true);
        });
});

test('should be able to add tag for feature', () => {
    expect.assertions(0);
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.createFeature({
        name: 'toggle.disabled',
        enabled: false,
        strategies: [{ name: 'default' }],
    });
    return request
        .post(`${base}/api/admin/features/toggle.disabled/tags`)
        .send({
            value: 'TeamRed',
            type: 'simple',
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});
test('should be able to get tags for feature', () => {
    expect.assertions(1);
    const { request, featureToggleStore, base } = getSetup();

    featureToggleStore.createFeature({
        name: 'toggle.disabled',
        enabled: false,
        strategies: [{ name: 'default' }],
    });

    featureToggleStore.tagFeature('toggle.disabled', {
        value: 'TeamGreen',
        type: 'simple',
    });
    return request
        .get(`${base}/api/admin/features/toggle.disabled/tags`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.tags.length).toBe(1);
        });
});

test('Invalid tag for feature should be rejected', () => {
    expect.assertions(1);
    const { request, featureToggleStore, base } = getSetup();

    featureToggleStore.createFeature({
        name: 'toggle.disabled',
        enabled: false,
        strategies: [{ name: 'default' }],
    });

    return request
        .post(`${base}/api/admin/features/toggle.disabled/tags`)
        .send({
            type: 'not url safe',
            value: 'some crazy value',
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect(res => {
            expect(res.body.details[0].message).toBe('"type" must be URL friendly');
        });
});

test('Should be able to filter on tag', () => {
    expect.assertions(2);
    const { request, featureToggleStore, base } = getSetup();

    featureToggleStore.createFeature({
        name: 'toggle.tagged',
        enabled: false,
        strategies: [{ name: 'default' }],
    });
    featureToggleStore.createFeature({
        name: 'toggle.untagged',
        enabled: false,
        strategies: [{ name: 'default' }],
    });

    featureToggleStore.tagFeature('toggle.tagged', {
        type: 'simple',
        value: 'mytag',
    });
    return request
        .get(`${base}/api/admin/features?tag=simple:mytag`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            expect(res.body.features.length).toBe(1);
            expect(res.body.features[0].name).toBe('toggle.tagged');
        });
});

test('Should be able to filter on name prefix', () => {
    expect.assertions(3);
    const { request, featureToggleStore, base } = getSetup();

    featureToggleStore.createFeature({
        name: 'a_team.toggle',
        enabled: false,
        strategies: [{ name: 'default' }],
    });
    featureToggleStore.createFeature({
        name: 'a_tag.toggle',
        enabled: false,
        strategies: [{ name: 'default' }],
    });
    featureToggleStore.createFeature({
        name: 'b_tag.toggle',
        enabled: false,
        strategies: [{ name: 'default' }],
    });

    return request
        .get(`${base}/api/admin/features?namePrefix=a_`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            expect(res.body.features.length).toBe(2);
            expect(res.body.features[0].name).toBe('a_team.toggle');
            expect(res.body.features[1].name).toBe('a_tag.toggle');
        });
});

test('Should be able to filter on project', () => {
    expect.assertions(3);
    const { request, featureToggleStore, base } = getSetup();

    featureToggleStore.createFeature({
        name: 'a_team.toggle',
        enabled: false,
        strategies: [{ name: 'default' }],
        project: 'projecta',
    });
    featureToggleStore.createFeature({
        name: 'a_tag.toggle',
        enabled: false,
        strategies: [{ name: 'default' }],
        project: 'projecta',
    });
    featureToggleStore.createFeature({
        name: 'b_tag.toggle',
        enabled: false,
        strategies: [{ name: 'default' }],
        project: 'projectb',
    });
    return request
        .get(`${base}/api/admin/features?project=projecta`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
            expect(res.body.features.length).toBe(2);
            expect(res.body.features[0].name).toBe('a_team.toggle');
            expect(res.body.features[1].name).toBe('a_tag.toggle');
        });
});

test('Tags should be included in archive events', async () => {
    const { request, eventStore, featureToggleStore, base } = getSetup();

    featureToggleStore.createFeature({
        name: 'a_team.toggle',
        enabled: false,
        strategies: [{ name: 'default' }],
        project: 'projecta',
    });
    featureToggleStore.tagFeature('a_team.toggle', {
        type: 'simple',
        value: 'tag',
    });
    await request
        .delete(`${base}/api/admin/features/a_team.toggle`)
        .expect(200);
    const events = await eventStore.getEvents();
    expect(events[0].type).toBe('feature-archived');
    expect(events[0].tags[0].type).toBe('simple');
    expect(events[0].tags[0].value).toBe('tag');
});

test('Tags should be included in updated events', async () => {
    const { request, eventStore, featureToggleStore, base } = getSetup();

    featureToggleStore.createFeature({
        name: 'a_team.toggle',
        enabled: false,
        strategies: [{ name: 'default' }],
        project: 'projecta',
    });
    featureToggleStore.tagFeature('a_team.toggle', {
        type: 'simple',
        value: 'tag',
    });
    await request
        .put(`${base}/api/admin/features/a_team.toggle`)
        .send({
            name: 'a_team.toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
            project: 'projectb',
        })
        .expect(200);
    const events = await eventStore.getEvents();
    expect(events[0].type).toBe('feature-updated');
    expect(events[0].tags[0].type).toBe('simple');
    expect(events[0].tags[0].value).toBe('tag');
});

test('Trying to get features while database is down should yield 500', () => {
    expect.assertions(0);
    getLogger.setMuteError(true);
    const { request, base } = getSetup(false);
    return request.get(`${base}/api/admin/features`).expect(500);
});

test('should mark toggle as stale', () => {
    expect.assertions(1);
    const toggleName = 'toggle-stale';
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.createFeature({
        name: toggleName,
        strategies: [{ name: 'default' }],
    });

    return request
        .post(`${base}/api/admin/features/${toggleName}/stale/on`)
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect(res => {
            expect(res.body.stale).toBe(true);
        });
});

test('should mark toggle as NOT stale', () => {
    expect.assertions(1);
    const toggleName = 'toggle-stale';
    const { request, featureToggleStore, base } = getSetup();
    featureToggleStore.createFeature({
        name: toggleName,
        strategies: [{ name: 'default' }],
        stale: true,
    });

    return request
        .post(`${base}/api/admin/features/${toggleName}/stale/off`)
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect(res => {
            expect(res.body.stale).toBe(false);
        });
});
