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
test.serial('Should include id and createdAt when saving', async t => {
    const clock = sinon.useFakeTimers();
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
    await clock.tickAsync(100);
    t.is(seen.length, 1);
    t.truthy(seen[0].id);
    t.truthy(seen[0].createdAt);
    t.is(seen[0].data.clientIp, event1.data.clientIp);
    t.is(seen[0].data.appName, event1.data.appName);
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
    const seen = [];
    eventStore.on(APPLICATION_CREATED, e => seen.push(e));
    await eventStore.batchStore([event1, event2, event3]);
    await clock.tickAsync(100);
    t.is(seen.length, 3);
    seen.forEach(e => {
        t.truthy(e.id);
        t.truthy(e.createdAt);
    });
    clock.restore();
});
