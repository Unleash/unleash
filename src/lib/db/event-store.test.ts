import knex from 'knex';
import EventStore from './event-store';
import getLogger from '../../test/fixtures/no-logger';

test('Trying to get events if db fails should yield empty list', async () => {
    const db = knex({
        client: 'pg',
    });
    const store = new EventStore(db, getLogger);
    const events = await store.getEvents();
    expect(events.length).toBe(0);
});

test('Trying to get events by name if db fails should yield empty list', async () => {
    const db = knex({
        client: 'pg',
    });
    const store = new EventStore(db, getLogger);
    const events = await store.getEventsFilterByType('application-created');
    expect(events).toBeTruthy();
    expect(events.length).toBe(0);
});
