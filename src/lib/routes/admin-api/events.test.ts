import supertest from 'supertest';
import { createServices } from '../../services';
import { createTestConfig } from '../../../test/config/test-config';

import createStores from '../../../test/fixtures/store';

import getApp from '../../app';
import {
    FeatureCreatedEvent,
    ProjectAccessAddedEvent,
    ProjectUserAddedEvent,
    ProjectUserRemovedEvent,
} from '../../types/events';
const TEST_USER_ID = -9999;
async function getSetup(anonymise: boolean = false) {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = createStores();
    const config = createTestConfig({
        server: { baseUriPath: base },
        experimental: { flags: { anonymiseEventLog: anonymise } },
    });
    const services = createServices(stores, config);
    const app = await getApp(config, stores, services);

    return {
        base,
        eventService: services.eventService,
        request: supertest(app),
    };
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
    const { request, base, eventService } = await getSetup();
    eventService.storeEvent(
        new FeatureCreatedEvent({
            createdBy: 'some@email.com',
            data: { name: 'test', project: 'default' },
            featureName: 'test',
            project: 'default',
            createdByUserId: TEST_USER_ID,
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
    const { request, base, eventService } = await getSetup(true);
    eventService.storeEvent(
        new FeatureCreatedEvent({
            createdBy: 'some@email.com',
            data: { name: 'test', project: 'default' },
            featureName: 'test',
            project: 'default',
            createdByUserId: TEST_USER_ID,
        }),
    );
    const { body } = await request
        .get(`${base}/api/admin/events`)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.events.length).toBe(1);
    expect(body.events[0].createdBy).toBe('676212ff7@unleash.run');
});

test('should also anonymise email fields in data and preData properties', async () => {
    const email1 = 'test1@email.com';
    const email2 = 'test2@email.com';

    const { request, base, eventService } = await getSetup(true);
    eventService.storeEvent(
        new ProjectUserAddedEvent({
            createdBy: 'some@email.com',
            createdByUserId: TEST_USER_ID,
            data: { name: 'test', project: 'default', email: email1 },
            project: 'default',
        }),
    );
    eventService.storeEvent(
        new ProjectUserRemovedEvent({
            createdBy: 'some@email.com',
            createdByUserId: TEST_USER_ID,
            preData: { name: 'test', project: 'default', email: email2 },
            project: 'default',
        }),
    );
    const { body } = await request
        .get(`${base}/api/admin/events`)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.events.length).toBe(2);
    expect(body.events[0].data.email).not.toBe(email1);
    expect(body.events[1].preData.email).not.toBe(email2);
});

test('should anonymise any PII fields, no matter the depth', async () => {
    const testUsername = 'test-username';

    const { request, base, eventService } = await getSetup(true);
    eventService.storeEvent(
        new ProjectAccessAddedEvent({
            createdBy: 'some@email.com',
            createdByUserId: TEST_USER_ID,
            data: {
                roles: [
                    {
                        roleId: 1,
                        groupIds: [1, 2],
                        // Doesn't reflect the real data structure for event here, normally a number array.
                        // Testing PII anonymisation
                        users: [{ id: 1, username: testUsername }],
                    },
                ],
            },
            project: 'default',
        }),
    );
    const { body } = await request
        .get(`${base}/api/admin/events`)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.events.length).toBe(1);
    expect(body.events[0].data.roles[0].users[0].username).not.toBe(
        testUsername,
    );
});
