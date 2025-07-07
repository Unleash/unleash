import knex from 'knex';
import { EventStore } from './event-store.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { subHours, formatRFC3339 } from 'date-fns';
import dbInit from '../../../test/e2e/helpers/database-init.js';
import { APPLICATION_CREATED } from '../../events/index.js';

beforeAll(() => {
    getLogger.setMuteError(true);
});

afterAll(() => {
    getLogger.setMuteError(false);
});

test('Trying to get events if db fails should yield empty list', async () => {
    const db = knex({
        client: 'pg',
    });
    const store = new EventStore(db, getLogger);
    const events = await store.getEvents();
    expect(events.length).toBe(0);
    await db.destroy();
});

test('Trying to get events by name if db fails should yield empty list', async () => {
    const db = knex({
        client: 'pg',
    });
    const store = new EventStore(db, getLogger);
    const events = await store.searchEvents(
        {
            offset: 0,
            limit: 10,
        },
        [
            {
                field: 'type',
                operator: 'IS',
                values: [APPLICATION_CREATED],
            },
        ],
    );
    expect(events).toBeTruthy();
    expect(events.length).toBe(0);
    await db.destroy();
});

// We might want to cap this to 500 and this test can help checking that
test('Find unannounced events returns all events', async () => {
    const db = await dbInit('events_test', getLogger);
    const type = 'application-created' as const;

    const allEvents = Array.from({ length: 505 }).map((_, i) => ({
        type,
        created_at: formatRFC3339(subHours(new Date(), i)),
        created_by: `test ${i}`,
        data: { name: 'test', iteration: i },
    }));
    await db.rawDatabase('events').insert(allEvents).returning(['id']);

    const store = new EventStore(db.rawDatabase, getLogger);
    const events = await store.setUnannouncedToAnnounced();
    expect(events).toBeTruthy();
    expect(events.length).toBe(505);
    await db.destroy();
});
