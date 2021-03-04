'use strict';

const test = require('ava');
const sinon = require('sinon');
const { APPLICATION_CREATED } = require('../../../lib/event-type');

const dbInit = require('../helpers/database-init');
const getLogger = require('../../fixtures/no-logger');

let stores;
let eventStore;

test.before(async () => {
    const db = await dbInit('event_store_serial', getLogger);
    stores = db.stores;
    eventStore = stores.eventStore;
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('Should be able to store multiple events at once', async t => {
    const clock = sinon.useFakeTimers();
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
    let seen = 0;
    eventStore.on(APPLICATION_CREATED, () => seen++);
    await eventStore.batchStore([event1, event2, event3]);
    await clock.tickAsync(100);
    t.is(seen, 3);
    clock.restore();
});
