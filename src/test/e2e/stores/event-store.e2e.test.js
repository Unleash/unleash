'use strict';

const {
    APPLICATION_CREATED,
    FEATURE_CREATED,
} = require('../../../lib/event-type');

const dbInit = require('../helpers/database-init');
const getLogger = require('../../fixtures/no-logger');

let db;
let stores;
let eventStore;

beforeAll(async () => {
    db = await dbInit('event_store_serial', getLogger);
    stores = db.stores;
    eventStore = stores.eventStore;
});

afterAll(async () => {
    await db.destroy();
});
test('Should include id and createdAt when saving', async () => {
    const event1 = {
        type: APPLICATION_CREATED,
        createdBy: '127.0.0.1',
        data: {
            clientIp: '127.0.0.1',
            appName: 'test1',
        },
    };
    const seen = [];
    eventStore.on(APPLICATION_CREATED, e => seen.push(e));
    await eventStore.store(event1);
    expect(seen.length).toBe(1);
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

    const promise = new Promise(resolve => {
        eventStore.on(FEATURE_CREATED, storedEvent => {
            expect(storedEvent.name).toBe(event.name);
            expect(Array.isArray(storedEvent.tags)).toBe(true);
            resolve();
        });
    });

    // Trigger
    await eventStore.store(event);

    return promise;
});

test('Should be able to store multiple events at once', async () => {
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
    eventStore.on(APPLICATION_CREATED, e => seen.push(e));
    await eventStore.batchStore([event1, event2, event3]);
    expect(seen.length).toBe(3);
    seen.forEach(e => {
        expect(e.id).toBeTruthy();
        expect(e.createdAt).toBeTruthy();
    });
});
