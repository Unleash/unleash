import type { EventSearchQueryParameters } from '../../../../lib/openapi/spec/event-search-query-parameters.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';

import {
    type IUnleashConfig,
    type IUnleashStores,
    RoleName,
} from '../../../../lib/types/index.js';
import type { EventService } from '../../../../lib/services/index.js';
import getLogger from '../../../fixtures/no-logger.js';
import {
    createUserWithRootRole,
    type IUnleashTest,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import { createEventsService } from '../../../../lib/features/index.js';
import { createTestConfig } from '../../../config/test-config.js';
import { FEATURE_CREATED, USER_CREATED } from '../../../../lib/events/index.js';
import { withTransactional } from '../../../../lib/db/transaction.js';
import { EventStore } from '../../../../lib/features/events/event-store.js';

let app: IUnleashTest;
let db: ITestDb;
let eventService: EventService;
const TEST_USER_ID = -9999;
const regularEmail = 'import-user@getunleash.io';
const adminEmail = 'admin-user@getunleash.io';

const config: IUnleashConfig = createTestConfig();
let stores: IUnleashStores;

beforeAll(async () => {
    db = await dbInit('event_search', getLogger);
    stores = db.stores;
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );

    eventService = createEventsService(db.rawDatabase, config);

    await createUserWithRootRole({
        app,
        stores,
        email: regularEmail,
    });

    await createUserWithRootRole({
        app,
        stores,
        email: adminEmail,
        roleName: RoleName.ADMIN,
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {
    await app.login({ email: adminEmail });
    await db.stores.featureToggleStore.deleteAll();
    await db.stores.segmentStore.deleteAll();
    await db.stores.eventStore.deleteAll();
});

const searchEvents = async (
    queryParams: EventSearchQueryParameters,
    expectedCode = 200,
) => {
    const query = new URLSearchParams(queryParams as any).toString();
    return app.request
        .get(`/api/admin/search/events?${query}`)
        .expect(expectedCode);
};

test('should search events by query', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'something-else',
        data: { id: 'some-other-feature' },
        tags: [],
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'something-else',
        data: { id: 'my-other-feature' },
        tags: [],
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({ query: 'some-other-feature' });

    expect(body).toMatchObject({
        events: [
            {
                type: 'feature-created',
                data: {
                    id: 'some-other-feature',
                },
            },
        ],
        total: 1,
    });
});

test('should filter events by feature', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        featureName: 'my_feature_a',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        featureName: 'my_feature_b',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({ feature: 'IS:my_feature_b' });

    expect(body).toMatchObject({
        events: [
            {
                type: 'feature-created',
                featureName: 'my_feature_b',
            },
        ],
        total: 1,
    });
});

test('should filter events by project', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'another_project',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({ project: 'IS:another_project' });

    expect(body).toMatchObject({
        events: [
            {
                type: 'feature-created',
                project: 'another_project',
            },
        ],
        total: 1,
    });
});

test('should filter events by type', async () => {
    await eventService.storeEvent({
        type: 'change-added',
        project: 'default',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: 'feature-created',
        project: 'default',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({ type: 'IS:change-added' });

    expect(body).toMatchObject({
        events: [
            {
                type: 'change-added',
            },
        ],
        total: 1,
    });
});

test('should filter events by created by', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        createdBy: 'admin1@example.com',
        createdByUserId: TEST_USER_ID + 1,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        createdBy: 'admin2@example.com',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({ createdBy: `IS:${TEST_USER_ID}` });

    expect(body).toMatchObject({
        events: [
            {
                createdBy: 'admin2@example.com',
            },
        ],
        total: 1,
    });
});

test('should filter events by created date range', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'my_feature_a' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'my_feature_b' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const today = new Date();

    const { body } = await searchEvents({
        from: `IS:${today.toISOString().split('T')[0]}`,
    });

    expect(body).toMatchObject({
        events: [
            {
                type: FEATURE_CREATED,
                data: { featureName: 'my_feature_b' },
            },
            {
                type: FEATURE_CREATED,
                data: { featureName: 'my_feature_a' },
            },
        ],
        total: 2,
    });
});

test('should include dates created on the `to` date', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'my_feature_b' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const today = new Date();

    const { body } = await searchEvents({
        to: `IS:${today.toISOString().split('T')[0]}`,
    });

    expect(body).toMatchObject({
        events: [
            {
                type: FEATURE_CREATED,
                data: { featureName: 'my_feature_b' },
            },
        ],
        total: 1,
    });
});

test('should not include events before `from` or after `to`', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'early-event' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'late-event' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'goldilocks' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { events } = await eventService.getEvents();
    const earlyEvent = events.find((e) => e.data.featureName === 'early-event');
    await db.rawDatabase.raw(
        `UPDATE events SET created_at = created_at - interval '1 day' where id = ?`,
        [earlyEvent?.id],
    );

    const lateEvent = events.find((e) => e.data.featureName === 'late-event');
    await db.rawDatabase.raw(
        `UPDATE events SET created_at = created_at + interval '1 day' where id = ?`,
        [lateEvent?.id],
    );

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const { body } = await searchEvents({
        from: `IS:${todayString}`,
        to: `IS:${todayString}`,
    });

    expect(body).toMatchObject({
        events: [
            {
                type: FEATURE_CREATED,
                data: { featureName: 'goldilocks' },
            },
        ],
        total: 1,
    });
});

test('should paginate with offset and limit', async () => {
    for (let i = 0; i < 5; i++) {
        await eventService.storeEvent({
            type: FEATURE_CREATED,
            project: 'default',
            data: { featureName: `my_feature_${i}` },
            createdBy: 'test-user',
            createdByUserId: TEST_USER_ID,
            ip: '127.0.0.1',
        });
    }

    const { body: secondPage } = await searchEvents({
        offset: '2',
        limit: '2',
    });

    expect(secondPage.events).toMatchObject([
        {
            data: { featureName: `my_feature_2` },
        },
        {
            data: { featureName: `my_feature_1` },
        },
    ]);
});

test('should filter events by feature using IS_ANY_OF', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        featureName: 'my_feature_a',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: USER_CREATED,
        featureName: 'my_feature_b',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        featureName: 'my_feature_c',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({
        feature: 'IS_ANY_OF:my_feature_a,my_feature_b',
    });

    expect(body).toMatchObject({
        events: [
            {
                type: 'user-created',
                featureName: 'my_feature_b',
            },
            {
                type: 'feature-created',
                featureName: 'my_feature_a',
            },
        ],
        total: 2,
    });
});

test('should filter events by project using IS_ANY_OF', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'project_a',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'project_b',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'project_c',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({
        project: 'IS_ANY_OF:project_a,project_b',
    });

    expect(body).toMatchObject({
        events: [
            {
                type: 'feature-created',
                project: 'project_b',
            },
            {
                type: 'feature-created',
                project: 'project_a',
            },
        ],
        total: 2,
    });
});

test('should not show user creation events for non-admins', async () => {
    await app.login({ email: regularEmail });
    await eventService.storeEvent({
        type: USER_CREATED,
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({});

    expect(body).toMatchObject({
        events: [
            {
                type: FEATURE_CREATED,
            },
        ],
        total: 1,
    });
});

test('should show user creation events for admins', async () => {
    await eventService.storeEvent({
        type: USER_CREATED,
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({});

    expect(body).toMatchObject({
        events: [
            {
                type: FEATURE_CREATED,
            },
            {
                type: USER_CREATED,
            },
        ],
        total: 2,
    });
});

test('should filter events by environment', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        environment: 'production',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        environment: 'staging',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({ environment: 'IS:production' });

    expect(body).toMatchObject({
        events: [
            {
                type: 'feature-created',
                environment: 'production',
            },
        ],
        total: 1,
    });
});

test('should filter events by environment using IS_ANY_OF', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        environment: 'production',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        environment: 'staging',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        environment: 'development',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({
        environment: 'IS_ANY_OF:production,staging',
    });

    expect(body).toMatchObject({
        events: [
            {
                type: 'feature-created',
                environment: 'staging',
            },
            {
                type: 'feature-created',
                environment: 'production',
            },
        ],
        total: 2,
    });
});

test('should filter events by ID', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { name: 'feature1' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { name: 'feature2' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { name: 'feature3' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body: allEventsResponse } = await searchEvents({});
    const targetEvent = allEventsResponse.events.find(
        (e: any) => e.data.name === 'feature2',
    );

    const { body } = await searchEvents({ id: `IS:${targetEvent.id}` });

    expect(body).toMatchObject({
        events: [
            {
                id: targetEvent.id,
                type: 'feature-created',
                data: { name: 'feature2' },
            },
        ],
        total: 1,
    });
});

test('should filter events by multiple IDs using IS_ANY_OF', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { name: 'feature1' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { name: 'feature2' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { name: 'feature3' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body: allEventsResponse } = await searchEvents({});
    const targetEvent1 = allEventsResponse.events.find(
        (e: any) => e.data.name === 'feature1',
    );
    const targetEvent3 = allEventsResponse.events.find(
        (e: any) => e.data.name === 'feature3',
    );

    const { body } = await searchEvents({
        id: `IS_ANY_OF:${targetEvent1.id},${targetEvent3.id}`,
    });

    expect(body.total).toBe(2);
    expect(body.events).toHaveLength(2);

    const returnedIds = body.events.map((e: any) => e.id);
    expect(returnedIds).toContain(targetEvent1.id);
    expect(returnedIds).toContain(targetEvent3.id);

    const feature2Event = allEventsResponse.events.find(
        (e: any) => e.data.name === 'feature2',
    );
    expect(returnedIds).not.toContain(feature2Event.id);
});

test('should filter events by group ID', async () => {
    const eventStoreService = withTransactional(
        (db) => new EventStore(db, getLogger),
        db.rawDatabase,
    );

    const events = [
        {
            type: FEATURE_CREATED,
            project: 'default',
            data: { name: 'feature1' },
            createdBy: 'test-user',
            createdByUserId: TEST_USER_ID,
            ip: '127.0.0.1',
        },
        {
            type: FEATURE_CREATED,
            project: 'default',
            data: { name: 'feature2' },
            createdBy: 'test-user',
            createdByUserId: TEST_USER_ID,
            ip: '127.0.0.1',
        },
    ];

    await eventStoreService.transactional(
        async (transactionalEventStore) => {
            await transactionalEventStore.batchStore(events);
        },
        { type: 'transaction', id: '1' },
    );

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { name: 'feature3' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({ groupId: 'IS:1' });

    expect(body.total).toBe(2);
    expect(body.events).toHaveLength(2);
    expect(body.events.every((e: any) => e.groupId === '1')).toBe(true);
});

test('should filter events by multiple group IDs using IS_ANY_OF', async () => {
    const eventStoreService = withTransactional(
        (db) => new EventStore(db, getLogger),
        db.rawDatabase,
    );

    const event1 = {
        type: FEATURE_CREATED,
        project: 'default',
        data: { name: 'feature1' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    };
    const event2 = {
        type: FEATURE_CREATED,
        project: 'default',
        data: { name: 'feature2' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    };
    const event3 = {
        type: FEATURE_CREATED,
        project: 'default',
        data: { name: 'feature3' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    };

    await eventStoreService.transactional(
        async (transactionalEventStore) => {
            await transactionalEventStore.store(event1);
        },
        { type: 'transaction', id: '10' },
    );

    await eventStoreService.transactional(
        async (transactionalEventStore) => {
            await transactionalEventStore.store(event2);
        },
        { type: 'transaction', id: '20' },
    );

    await eventStoreService.transactional(
        async (transactionalEventStore) => {
            await transactionalEventStore.store(event3);
        },
        { type: 'transaction', id: '30' },
    );

    const { body } = await searchEvents({ groupId: 'IS_ANY_OF:10,30' });

    expect(body.total).toBe(2);
    expect(body.events).toHaveLength(2);

    const returnedGroupIds = body.events.map((e: any) => e.groupId);
    expect(returnedGroupIds).toContain('10');
    expect(returnedGroupIds).toContain('30');
    expect(returnedGroupIds).not.toContain('20');
});

test('Should return empty result when filtering by non-existent group ID', async () => {
    const eventStoreService = withTransactional(
        (db) => new EventStore(db, getLogger),
        db.rawDatabase,
    );

    await eventStoreService.transactional(
        async (transactionalEventStore) => {
            await transactionalEventStore.store({
                type: FEATURE_CREATED,
                project: 'default',
                data: { name: 'feature1' },
                createdBy: 'test-user',
                createdByUserId: TEST_USER_ID,
                ip: '127.0.0.1',
            });
        },
        { type: 'transaction', id: '1' },
    );

    const { body } = await searchEvents({ groupId: 'IS:999' });

    expect(body.total).toBe(0);
    expect(body.events).toHaveLength(0);
});
