import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { FEATURE_CREATED, IBaseEvent } from '../../../../lib/types/events';
import { randomId } from '../../../../lib/util/random-id';
import { EventService } from '../../../../lib/services';
import { EventEmitter } from 'stream';

let app: IUnleashTest;
let db: ITestDb;
let eventService: EventService;
const TEST_USER_ID = -9999;
beforeAll(async () => {
    db = await dbInit('event_api_serial', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    });
    eventService = new EventService(db.stores, {
        getLogger,
        eventBus: new EventEmitter(),
    });
});

beforeEach(async () => {
    await db.stores.eventStore.deleteAll();
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
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'something-else',
        data: { id: 'some-other-feature' },
        tags: [],
        createdBy: 'test-user',
        environment: 'test',
        createdByUserId: TEST_USER_ID,
    });
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { id: 'feature' },
        tags: [],
        createdBy: 'test-user',
        environment: 'test',
        createdByUserId: TEST_USER_ID,
    });
    await app.request
        .get('/api/admin/events?project=default')
        .expect(200)
        .expect((res) => {
            expect(res.body.events).toHaveLength(1);
            expect(res.body.events[0].data.id).toEqual('feature');
        });
});

test('can search for events', async () => {
    const events: IBaseEvent[] = [
        {
            type: FEATURE_CREATED,
            project: randomId(),
            data: { id: randomId() },
            tags: [],
            createdBy: randomId(),
            createdByUserId: TEST_USER_ID,
        },
        {
            type: FEATURE_CREATED,
            project: randomId(),
            data: { id: randomId() },
            preData: { id: randomId() },
            tags: [{ type: 'simple', value: randomId() }],
            createdBy: randomId(),
            createdByUserId: TEST_USER_ID,
        },
    ];

    await Promise.all(
        events.map((event) => {
            return eventService.storeEvent(event);
        }),
    );

    await app.request
        .post('/api/admin/events/search')
        .send({})
        .expect(200)
        .expect((res) => {
            expect(res.body.events).toHaveLength(2);
        });
    await app.request
        .post('/api/admin/events/search')
        .send({ limit: 1, offset: 1 })
        .expect(200)
        .expect((res) => {
            expect(res.body.events).toHaveLength(1);
        });
    await app.request
        .post('/api/admin/events/search')
        .send({ query: events[1].data.id })
        .expect(200)
        .expect((res) => {
            expect(res.body.events).toHaveLength(1);
            expect(res.body.events[0].data.id).toEqual(events[1].data.id);
        });
    await app.request
        .post('/api/admin/events/search')
        .send({ query: events[1].preData.id })
        .expect(200)
        .expect((res) => {
            expect(res.body.events).toHaveLength(1);
            expect(res.body.events[0].preData.id).toEqual(events[1].preData.id);
        });
    await app.request
        .post('/api/admin/events/search')
        .send({ query: events[1].tags![0].value })
        .expect(200)
        .expect((res) => {
            expect(res.body.events).toHaveLength(1);
            expect(res.body.events[0].data.id).toEqual(events[1].data.id);
        });
});
