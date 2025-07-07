import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import {
    FEATURE_CREATED,
    type IBaseEvent,
} from '../../../../lib/events/index.js';
import { randomId } from '../../../../lib/util/random-id.js';
import type { EventService } from '../../../../lib/services/index.js';
import {
    type IUnleashConfig,
    SYSTEM_USER,
} from '../../../../lib/types/index.js';
import { createEventsService } from '../../../../lib/features/index.js';
import { createTestConfig } from '../../../config/test-config.js';

let app: IUnleashTest;
let db: ITestDb;
let eventService: EventService;
const TEST_USER_ID = -9999;

const config: IUnleashConfig = createTestConfig();

beforeAll(async () => {
    db = await dbInit('event_api_serial', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    });
    eventService = createEventsService(db.rawDatabase, config);
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
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { id: 'feature' },
        tags: [],
        createdBy: 'test-user',
        environment: 'test',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });
    await app.request
        .get('/api/admin/events?project=default')
        .expect(200)
        .expect((res) => {
            expect(res.body.events).toHaveLength(1);
            expect(res.body.events[0].data.id).toEqual('feature');
        });
});

test('event creators - if system user, return system name, else should return name from database if user exists, else from events table', async () => {
    const user = await db.stores.userStore.insert({ name: 'database-user' });
    const events: IBaseEvent[] = [
        {
            type: FEATURE_CREATED,
            project: randomId(),
            createdBy: 'should-not-use-this-name',
            createdByUserId: SYSTEM_USER.id,
            ip: '127.0.0.1',
        },
        {
            type: FEATURE_CREATED,
            project: randomId(),
            createdBy: 'test-user1',
            createdByUserId: user.id,
            ip: '127.0.0.1',
        },
        {
            type: FEATURE_CREATED,
            project: randomId(),
            createdBy: 'test-user2',
            createdByUserId: 2,
            ip: '127.0.0.1',
        },
    ];

    await Promise.all(
        events.map((event) => {
            return eventService.storeEvent(event);
        }),
    );

    const { body } = await app.request
        .get('/api/admin/event-creators')
        .expect(200);
    expect(body).toMatchObject([
        {
            id: SYSTEM_USER.id,
            name: SYSTEM_USER.name,
        },
        {
            id: 1,
            name: 'database-user',
        },
        {
            id: 2,
            name: 'test-user2',
        },
    ]);
});

test('event creators - takes single distinct username, if 2 users have same id', async () => {
    const events: IBaseEvent[] = [
        {
            type: FEATURE_CREATED,
            project: randomId(),
            createdBy: 'test-user4',
            createdByUserId: 2,
            ip: '127.0.0.1',
        },
        {
            type: FEATURE_CREATED,
            project: randomId(),
            createdBy: 'test-user2',
            createdByUserId: 2,
            ip: '127.0.0.1',
        },
    ];

    await Promise.all(
        events.map((event) => {
            return eventService.storeEvent(event);
        }),
    );

    const { body } = await app.request
        .get('/api/admin/event-creators')
        .expect(200);
    expect(body).toMatchObject([
        {
            id: 2,
        },
    ]);
});
