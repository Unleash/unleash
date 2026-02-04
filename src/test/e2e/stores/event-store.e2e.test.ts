import {
    APPLICATION_CREATED,
    FEATURE_CREATED,
    FEATURE_DELETED,
    FEATURE_TAGGED,
    FEATURE_UPDATED,
    SEGMENT_UPDATED,
    type IEvent,
} from '../../../lib/events/index.js';
import {
    FeatureCreatedEvent,
    FeatureDeletedEvent,
    FeatureTaggedEvent,
    FeatureUpdatedEvent,
} from '../../../lib/types/index.js';

import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';
import type { IEventStore } from '../../../lib/types/stores/event-store.js';
import type { IAuditUser, IUnleashStores } from '../../../lib/types/index.js';
import {
    withTransactional,
    type TransactionUserParams,
} from '../../../lib/db/transaction.js';
import { EventStore } from '../../../lib/features/events/event-store.js';

import { vi } from 'vitest';

let db: ITestDb;
let stores: IUnleashStores;
let eventStore: IEventStore;
const TEST_USER_ID = -9999;

const testAudit: IAuditUser = {
    id: TEST_USER_ID,
    username: 'test@example.com',
    ip: '127.0.0.1',
};

beforeAll(async () => {
    db = await dbInit('event_store_serial', getLogger);
    stores = db.stores;
    eventStore = stores.eventStore;
});

beforeEach(async () => {
    await eventStore.deleteAll();
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
test('Should include id and createdAt when saving', async () => {
    vi.useFakeTimers();
    const event1 = {
        type: APPLICATION_CREATED,
        createdBy: '127.0.0.1',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
        data: {
            clientIp: '127.0.0.1',
            appName: 'test1',
        },
    };
    const seen: Array<IEvent> = [];
    eventStore.on(APPLICATION_CREATED, (e) => seen.push(e));
    await eventStore.store(event1);
    await eventStore.publishUnannouncedEvents();
    expect(seen).toHaveLength(1);
    expect(seen[0].id).toBeTruthy();
    expect(seen[0].createdAt).toBeTruthy();
    expect(seen[0].data.clientIp).toBe(event1.data.clientIp);
    expect(seen[0].data.appName).toBe(event1.data.appName);
    vi.useRealTimers();
});

test('Should include empty tags array for new event', async () => {
    expect.assertions(2);
    const event = {
        type: FEATURE_CREATED,
        createdBy: 'me@mail.com',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
        data: {
            name: 'someName',
            enabled: true,
            strategies: [{ name: 'default' }],
        },
    };

    const promise = new Promise<void>((resolve) => {
        eventStore.on(FEATURE_CREATED, (storedEvent: IEvent) => {
            expect(storedEvent.data.name).toBe(event.data.name);
            expect(Array.isArray(storedEvent.tags)).toBe(true);
            resolve();
        });
    });

    // Trigger
    await eventStore.store(event);
    await eventStore.publishUnannouncedEvents();

    return promise;
});

test('Should be able to store multiple events at once', async () => {
    vi.useFakeTimers();
    const event1 = {
        type: APPLICATION_CREATED,
        createdByUserId: TEST_USER_ID,
        createdBy: '127.0.0.1',
        data: {
            clientIp: '127.0.0.1',
            appName: 'test1',
        },
        ip: '127.0.0.1',
    };
    const event2 = {
        type: APPLICATION_CREATED,
        createdByUserId: TEST_USER_ID,
        createdBy: '127.0.0.1',
        data: {
            clientIp: '127.0.0.1',
            appName: 'test2',
        },
        ip: '127.0.0.1',
    };
    const event3 = {
        type: APPLICATION_CREATED,
        createdByUserId: TEST_USER_ID,
        createdBy: '127.0.0.1',
        data: {
            clientIp: '127.0.0.1',
            appName: 'test3',
        },
        tags: [{ type: 'simple', value: 'mytest' }],
        ip: '127.0.0.1',
    };
    const seen: IEvent[] = [];
    eventStore.on(APPLICATION_CREATED, (e) => seen.push(e));
    await eventStore.batchStore([event1, event2, event3]);
    await eventStore.publishUnannouncedEvents();
    expect(seen.length).toBe(3);
    seen.forEach((e) => {
        expect(e.id).toBeTruthy();
        expect(e.createdAt).toBeTruthy();
    });
    vi.useRealTimers();
});

test('Should get all stored events', async () => {
    const event = {
        type: FEATURE_CREATED,
        createdBy: 'me@mail.com',
        createdByUserId: TEST_USER_ID,
        data: {
            name: 'someName',
            enabled: true,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    };
    await eventStore.store(event);
    const events = await eventStore.getAll();
    const lastEvent = events[0];

    expect(lastEvent.type).toBe(event.type);
    expect(lastEvent.createdBy).toBe(event.createdBy);
});

test('Should delete stored event', async () => {
    const event = {
        type: FEATURE_CREATED,
        createdByUserId: TEST_USER_ID,
        createdBy: 'me@mail.com',
        data: {
            name: 'someName',
            enabled: true,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    };
    await eventStore.store(event);
    await eventStore.store(event);
    const events = await eventStore.getAll();
    const lastEvent = events[0];
    await eventStore.delete(lastEvent.id);

    const eventsAfterDelete = await eventStore.getAll();
    const lastEventAfterDelete = eventsAfterDelete[0];

    expect(events.length - eventsAfterDelete.length).toBe(1);
    expect(lastEventAfterDelete.id).not.toBe(lastEvent.id);
});

test('Should get stored event by id', async () => {
    const event = {
        type: FEATURE_CREATED,
        createdBy: 'me@mail.com',
        createdByUserId: TEST_USER_ID,
        data: {
            name: 'someName',
            enabled: true,
            strategies: [{ name: 'default' }],
        },
        ip: '127.0.0.1',
    };
    await eventStore.store(event);
    const events = await eventStore.getAll();
    const lastEvent = events[0];
    const exists = await eventStore.exists(lastEvent.id);
    const byId = await eventStore.get(lastEvent.id);

    expect(lastEvent).toStrictEqual(byId);
    expect(exists).toBe(true);
});

test('Should delete all stored events', async () => {
    await eventStore.deleteAll();

    const events = await eventStore.getAll();

    expect(events).toHaveLength(0);
});

test('Should get all events of type', async () => {
    const data = { name: 'someName', project: 'test-project' };
    await Promise.all(
        [0, 1, 2, 3, 4, 5].map(async (id) => {
            const event =
                id % 2 === 0
                    ? new FeatureCreatedEvent({
                          project: data.project,
                          featureName: data.name,
                          auditUser: testAudit,

                          data,
                      })
                    : new FeatureDeletedEvent({
                          project: data.project,
                          preData: data,
                          featureName: data.name,
                          auditUser: testAudit,

                          tags: [],
                      });
            return eventStore.store(event);
        }),
    );
    const featureCreatedEvents = await eventStore.searchEvents(
        {
            offset: 0,
            limit: 10,
        },
        [
            {
                field: 'type',
                operator: 'IS',
                values: [FEATURE_CREATED],
            },
        ],
    );
    expect(featureCreatedEvents).toHaveLength(3);
    const featureDeletedEvents = await eventStore.searchEvents(
        {
            offset: 0,
            limit: 10,
        },
        [
            {
                field: 'type',
                operator: 'IS',
                values: [FEATURE_DELETED],
            },
        ],
    );
    expect(featureDeletedEvents).toHaveLength(3);
});

test('getMaxRevisionId should exclude FEATURE_TAGGED events', async () => {
    const featureName = 'test-feature';
    const project = 'test-project';

    const featureTaggedEvent = new FeatureTaggedEvent({
        project,
        featureName,
        auditUser: testAudit,
        data: { type: 'simple', value: 'test-tag' },
    });

    const featureUpdatedEvent = new FeatureUpdatedEvent({
        project,
        featureName,
        auditUser: testAudit,
        data: { name: featureName, enabled: false },
    });

    const segmentUpdatedEvent = {
        type: SEGMENT_UPDATED,
        createdBy: testAudit.username,
        createdByUserId: testAudit.id,
        ip: testAudit.ip,
        data: { id: 1, name: 'test-segment' },
    };

    await eventStore.store(featureTaggedEvent);
    const maxRevisionAfterTagged = await eventStore.getMaxRevisionId();

    await eventStore.store(featureUpdatedEvent);
    const maxRevisionAfterUpdated = await eventStore.getMaxRevisionId();

    await eventStore.store(segmentUpdatedEvent);
    const maxRevisionAfterSegment = await eventStore.getMaxRevisionId();

    const allEvents = await eventStore.getAll();
    const taggedEvent = allEvents.find((e) => e.type === FEATURE_TAGGED);
    const updatedEvent = allEvents.find((e) => e.type === FEATURE_UPDATED);
    const segmentEvent = allEvents.find((e) => e.type === SEGMENT_UPDATED);

    expect(maxRevisionAfterTagged).toBe(0);
    expect(maxRevisionAfterUpdated).toBe(updatedEvent!.id);
    expect(maxRevisionAfterSegment).toBe(segmentEvent!.id);

    expect(taggedEvent).toBeDefined();
    expect(updatedEvent).toBeDefined();
    expect(segmentEvent).toBeDefined();

    expect(updatedEvent!.id).toBeGreaterThan(taggedEvent!.id);
    expect(segmentEvent!.id).toBeGreaterThan(updatedEvent!.id);
});

test('Should filter events by ID using IS operator', async () => {
    const event1 = {
        type: FEATURE_CREATED,
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
        data: { name: 'feature1' },
    };
    const event2 = {
        type: FEATURE_CREATED,
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
        data: { name: 'feature2' },
    };
    const event3 = {
        type: FEATURE_CREATED,
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
        data: { name: 'feature3' },
    };

    await eventStore.store(event1);
    await eventStore.store(event2);
    await eventStore.store(event3);

    const allEvents = await eventStore.getAll();
    const targetEvent = allEvents.find((e) => e.data.name === 'feature2');

    const filteredEvents = await eventStore.searchEvents(
        {
            offset: 0,
            limit: 10,
        },
        [
            {
                field: 'id',
                operator: 'IS',
                values: [targetEvent!.id.toString()],
            },
        ],
    );

    expect(filteredEvents).toHaveLength(1);
    expect(filteredEvents[0].id).toBe(targetEvent!.id);
    expect(filteredEvents[0].data.name).toBe('feature2');
});

test('Should filter events by ID using IS_ANY_OF operator', async () => {
    const event1 = {
        type: FEATURE_CREATED,
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
        data: { name: 'feature1' },
    };
    const event2 = {
        type: FEATURE_CREATED,
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
        data: { name: 'feature2' },
    };
    const event3 = {
        type: FEATURE_CREATED,
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
        data: { name: 'feature3' },
    };

    await eventStore.store(event1);
    await eventStore.store(event2);
    await eventStore.store(event3);

    const allEvents = await eventStore.getAll();
    const targetEvent1 = allEvents.find((e) => e.data.name === 'feature1');
    const targetEvent3 = allEvents.find((e) => e.data.name === 'feature3');

    const filteredEvents = await eventStore.searchEvents(
        {
            offset: 0,
            limit: 10,
        },
        [
            {
                field: 'id',
                operator: 'IS_ANY_OF',
                values: [
                    targetEvent1!.id.toString(),
                    targetEvent3!.id.toString(),
                ],
            },
        ],
    );

    expect(filteredEvents).toHaveLength(2);
    const eventIds = filteredEvents.map((e) => e.id);
    expect(eventIds).toContain(targetEvent1!.id);
    expect(eventIds).toContain(targetEvent3!.id);
    expect(eventIds).not.toContain(
        allEvents.find((e) => e.data.name === 'feature2')!.id,
    );
});

test('Should return empty result when filtering by non-existent ID', async () => {
    const event = {
        type: FEATURE_CREATED,
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
        data: { name: 'feature1' },
    };

    await eventStore.store(event);

    const filteredEvents = await eventStore.searchEvents(
        {
            offset: 0,
            limit: 10,
        },
        [
            {
                field: 'id',
                operator: 'IS',
                values: ['999999'],
            },
        ],
    );

    expect(filteredEvents).toHaveLength(0);
});

test('Should store and retrieve transaction context fields', async () => {
    const mockTransactionContext: TransactionUserParams = {
        type: 'change-request',
        id: '01HQVX5K8P9EXAMPLE123456',
    };

    const eventStoreService = withTransactional(
        (db) => new EventStore(db, getLogger),
        db.rawDatabase,
    );

    const event = {
        type: FEATURE_CREATED,
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        featureName: 'test-feature-with-context',
        project: 'test-project',
        ip: '127.0.0.1',
        data: {
            name: 'test-feature-with-context',
            enabled: true,
            strategies: [{ name: 'default' }],
        },
    };

    await eventStoreService.transactional(async (transactionalEventStore) => {
        await transactionalEventStore.store(event);
    }, mockTransactionContext);

    const events = await eventStore.getAll();
    const storedEvent = events.find(
        (e) => e.featureName === 'test-feature-with-context',
    );

    expect(storedEvent).toBeTruthy();
    expect(storedEvent!.groupType).toBe('change-request');
    expect(storedEvent!.groupId).toBe('01HQVX5K8P9EXAMPLE123456');
});

test('Should handle missing transaction context gracefully', async () => {
    const event = {
        type: FEATURE_CREATED,
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        featureName: 'test-feature-no-context',
        project: 'test-project',
        ip: '127.0.0.1',
        data: {
            name: 'test-feature-no-context',
            enabled: true,
            strategies: [{ name: 'default' }],
        },
    };

    await eventStore.store(event);

    const events = await eventStore.getAll();
    const storedEvent = events.find(
        (e) => e.featureName === 'test-feature-no-context',
    );

    expect(storedEvent).toBeTruthy();
    expect(storedEvent!.groupType).toBeUndefined();
    expect(storedEvent!.groupId).toBeUndefined();
});

test('Should store transaction context in batch operations', async () => {
    const mockTransactionContext: TransactionUserParams = {
        type: 'transaction',
        id: '01HQVX5K8P9BATCH123456',
    };

    const eventStoreService = withTransactional(
        (db) => new EventStore(db, getLogger),
        db.rawDatabase,
    );

    const events = [
        {
            type: FEATURE_CREATED,
            createdBy: 'test-user',
            createdByUserId: TEST_USER_ID,
            featureName: 'batch-feature-1',
            project: 'test-project',
            ip: '127.0.0.1',
            data: { name: 'batch-feature-1' },
        },
        {
            type: FEATURE_UPDATED,
            createdBy: 'test-user',
            createdByUserId: TEST_USER_ID,
            featureName: 'batch-feature-2',
            project: 'test-project',
            ip: '127.0.0.1',
            data: { name: 'batch-feature-2' },
        },
    ];

    await eventStoreService.transactional(async (transactionalEventStore) => {
        await transactionalEventStore.batchStore(events);
    }, mockTransactionContext);

    const allEvents = await eventStore.getAll();
    const batchEvents = allEvents.filter(
        (e) =>
            e.featureName === 'batch-feature-1' ||
            e.featureName === 'batch-feature-2',
    );

    expect(batchEvents).toHaveLength(2);
    batchEvents.forEach((event) => {
        expect(event.groupType).toBe('transaction');
        expect(event.groupId).toBe('01HQVX5K8P9BATCH123456');
    });
});

test('Should auto-generate transaction context when none provided', async () => {
    const eventStoreService = withTransactional(
        (db) => new EventStore(db, getLogger),
        db.rawDatabase,
    );

    const event = {
        type: FEATURE_CREATED,
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        featureName: 'test-feature-auto-context',
        project: 'test-project',
        ip: '127.0.0.1',
        data: {
            name: 'test-feature-auto-context',
            enabled: true,
            strategies: [{ name: 'default' }],
        },
    };

    await eventStoreService.transactional(async (transactionalEventStore) => {
        await transactionalEventStore.store(event);
    });

    const events = await eventStore.getAll();
    const storedEvent = events.find(
        (e) => e.featureName === 'test-feature-auto-context',
    );

    expect(storedEvent).toBeTruthy();
    expect(storedEvent!.groupType).toBe('transaction');
    expect(storedEvent!.groupId).toBeTruthy();
    expect(typeof storedEvent!.groupId).toBe('string');
    expect(storedEvent!.groupId).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
});
