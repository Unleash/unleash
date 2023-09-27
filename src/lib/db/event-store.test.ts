import knex from 'knex';
import EventStore from './event-store';
import getLogger from '../../test/fixtures/no-logger';
import { subHours, formatRFC3339 } from 'date-fns';
import dbInit from '../../test/e2e/helpers/database-init';

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
});

test('Trying to get events by name if db fails should yield empty list', async () => {
    const db = knex({
        client: 'pg',
    });
    const store = new EventStore(db, getLogger);
    const events = await store.searchEvents({ type: 'application-created' });
    expect(events).toBeTruthy();
    expect(events.length).toBe(0);
});

test.each([
    {
        createdAt: formatRFC3339(subHours(new Date(), 1)),
        expectedCount: 1,
    },
    {
        createdAt: formatRFC3339(subHours(new Date(), 23)),
        expectedCount: 1,
    },
    {
        createdAt: formatRFC3339(subHours(new Date(), 25)),
        expectedCount: 0,
    },
])(
    'Find unnanounced events is capped to last 24hs',
    async ({ createdAt, expectedCount }) => {
        const db = await dbInit('events_test', getLogger);
        const type = 'application-created' as const;
        const insertQuery = db.rawDatabase('events');
        await insertQuery
            .insert({
                type,
                created_at: createdAt,
                created_by: 'a test',
                data: { name: 'test', createdAt },
            })
            .returning(['id']);

        const store = new EventStore(db.rawDatabase, getLogger);
        const events = await store.setUnannouncedToAnnounced();
        expect(events).toBeTruthy();
        expect(events.length).toBe(expectedCount);
    },
);
