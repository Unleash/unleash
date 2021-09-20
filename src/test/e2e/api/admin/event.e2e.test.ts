import { IUnleashTest, setupApp } from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { FEATURE_CREATED } from '../../../../lib/types/events';
import { IEventStore } from '../../../../lib/types/stores/event-store';

let app: IUnleashTest;
let db: ITestDb;
let eventStore: IEventStore;

beforeAll(async () => {
    db = await dbInit('event_api_serial', getLogger);
    app = await setupApp(db.stores);
    eventStore = db.stores.eventStore;
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns events', async () => {
    expect.assertions(0);
    return app.request
        .get('/api/admin/events')
        .expect('Content-Type', /json/)
        .expect(200);
});

test('returns events given a name', async () => {
    expect.assertions(0);
    return app.request
        .get('/api/admin/events/myname')
        .expect('Content-Type', /json/)
        .expect(200);
});

test('Can filter by project', async () => {
    await eventStore.store({
        type: FEATURE_CREATED,
        project: 'something-else',
        data: { id: 'some-other-feature' },
        tags: [],
        createdBy: 'test-user',
        environment: 'test',
    });
    await eventStore.store({
        type: FEATURE_CREATED,
        project: 'default',
        data: { id: 'feature' },
        tags: [],
        createdBy: 'test-user',
        environment: 'test',
    });
    await app.request
        .get('/api/admin/events?project=default')
        .expect(200)
        .expect((res) => {
            expect(res.body.events).toHaveLength(1);
            expect(res.body.events[0].data.id).toEqual('feature');
        });
});
