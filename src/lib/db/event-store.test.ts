import test from 'ava';
import knex from 'knex';
import EventStore from './event-store';
import getLogger from '../../test/fixtures/no-logger';

test('Trying to get events if db fails should yield empty list', async t => {
    const db = knex({
        client: 'pg',
    });
    const store = new EventStore(db, getLogger);
    const events = await store.getEvents();
    t.is(events.length, 0);
});

test('Trying to get events by name if db fails should yield empty list', async t => {
    const db = knex({
        client: 'pg',
    });
    const store = new EventStore(db, getLogger);
    const events = await store.getEventsFilterByName('application-created');
    t.truthy(events);
    t.is(events.length, 0);
});
