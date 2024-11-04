import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import { FEATURE_CREATED, type IUnleashConfig } from '../../types';
import type { EventService } from '../../services';
import { createEventsService } from '../events/createEventsService';
import { createTestConfig } from '../../../test/config/test-config';

let app: IUnleashTest;
let db: ITestDb;
let eventService: EventService;

const TEST_USER_ID = -9999;
const config: IUnleashConfig = createTestConfig();

beforeAll(async () => {
    db = await dbInit('projects_status', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );
    eventService = createEventsService(db.rawDatabase, config);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('project insights should return correct count for each day', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'today-event' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'today-event-two' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'yesterday-event' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { events } = await eventService.getEvents();

    const lateEvent = events.find(
        (e) => e.data.featureName === 'yesterday-event',
    );
    await db.rawDatabase.raw(
        `UPDATE events SET created_at = created_at - interval '1 day' where id = ?`,
        [lateEvent?.id],
    );

    const { body } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    expect(body).toMatchObject({
        activityCountByDate: [
            { date: yesterdayString, count: 1 },
            { date: todayString, count: 2 },
        ],
    });
});
