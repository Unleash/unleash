import {
    APPLICATION_CREATED,
    FEATURE_CREATED,
    FEATURE_DELETED,
    FeatureCreatedEvent,
    FeatureDeletedEvent,
    IEvent,
} from '../../../lib/types/events';

import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import { IEventStore } from '../../../lib/types/stores/event-store';
import { IUnleashStores } from '../../../lib/types';

let db;
let stores: IUnleashStores;
let eventStore: IEventStore;

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
    jest.useFakeTimers();
    const event1 = {
        type: APPLICATION_CREATED,
        createdBy: '127.0.0.1',
        data: {
            clientIp: '127.0.0.1',
            appName: 'test1',
        },
    };
    const seen = [];
    eventStore.on(APPLICATION_CREATED, (e) => seen.push(e));
    await eventStore.store(event1);
    jest.advanceTimersByTime(100);
    expect(seen).toHaveLength(1);
    expect(seen[0].id).toBeTruthy();
    expect(seen[0].createdAt).toBeTruthy();
    expect(seen[0].data.clientIp).toBe(event1.data.clientIp);
    expect(seen[0].data.appName).toBe(event1.data.appName);
    jest.useRealTimers();
});

test('Should include empty tags array for new event', async () => {
    expect.assertions(2);
    const event = {
        type: FEATURE_CREATED,
        createdBy: 'me@mail.com',
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

    return promise;
});

test('Should be able to store multiple events at once', async () => {
    jest.useFakeTimers();
    const event1 = {
        type: APPLICATION_CREATED,
        createdBy: '127.0.0.1',
        data: {
            clientIp: '127.0.0.1',
            appName: 'test1',
        },
    };
    const event2 = {
        type: APPLICATION_CREATED,
        createdBy: '127.0.0.1',
        data: {
            clientIp: '127.0.0.1',
            appName: 'test2',
        },
    };
    const event3 = {
        type: APPLICATION_CREATED,
        createdBy: '127.0.0.1',
        data: {
            clientIp: '127.0.0.1',
            appName: 'test3',
        },
        tags: [{ type: 'simple', value: 'mytest' }],
    };
    const seen = [];
    eventStore.on(APPLICATION_CREATED, (e) => seen.push(e));
    await eventStore.batchStore([event1, event2, event3]);
    jest.advanceTimersByTime(100);
    expect(seen.length).toBe(3);
    seen.forEach((e) => {
        expect(e.id).toBeTruthy();
        expect(e.createdAt).toBeTruthy();
    });
    jest.useRealTimers();
});

test('Should get all stored events', async () => {
    const event = {
        type: FEATURE_CREATED,
        createdBy: 'me@mail.com',
        data: {
            name: 'someName',
            enabled: true,
            strategies: [{ name: 'default' }],
        },
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
        createdBy: 'me@mail.com',
        data: {
            name: 'someName',
            enabled: true,
            strategies: [{ name: 'default' }],
        },
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
        data: {
            name: 'someName',
            enabled: true,
            strategies: [{ name: 'default' }],
        },
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
                id % 2 == 0
                    ? new FeatureCreatedEvent({
                          project: data.project,
                          featureName: data.name,
                          createdBy: 'test-user',
                          data,
                          tags: [],
                      })
                    : new FeatureDeletedEvent({
                          project: data.project,
                          preData: data,
                          featureName: data.name,
                          createdBy: 'test-user',
                          tags: [],
                      });
            return eventStore.store(event);
        }),
    );
    const featureCreatedEvents = await eventStore.searchEvents({
        type: FEATURE_CREATED,
    });
    expect(featureCreatedEvents).toHaveLength(3);
    const featureDeletedEvents = await eventStore.searchEvents({
        type: FEATURE_DELETED,
    });
    expect(featureDeletedEvents).toHaveLength(3);
});
