import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import {
    FEATURE_CREATED,
    RoleName,
    type IAuditUser,
    type IUnleashConfig,
} from '../../types';
import type { EventService } from '../../services';
import { createEventsService } from '../events/createEventsService';
import { createTestConfig } from '../../../test/config/test-config';
import { randomId } from '../../util';
import { ApiTokenType } from '../../types/models/api-token';

let app: IUnleashTest;
let db: ITestDb;
let eventService: EventService;

const TEST_USER_ID = -9999;
const config: IUnleashConfig = createTestConfig();

const insertHealthScore = (id: string, health: number) => {
    const irrelevantFlagTrendDetails = {
        total_flags: 10,
        stale_flags: 10,
        potentially_stale_flags: 10,
    };
    return db.rawDatabase('flag_trends').insert({
        ...irrelevantFlagTrendDetails,
        id,
        project: 'default',
        health,
    });
};

const getCurrentDateStrings = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    return { todayString, yesterdayString };
};

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

beforeEach(async () => {
    await db.stores.clientMetricsStoreV2.deleteAll();
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

    const yesterdayEvent = events.find(
        (e) => e.data.featureName === 'yesterday-event',
    );

    const { todayString, yesterdayString } = getCurrentDateStrings();

    await db.rawDatabase.raw(`UPDATE events SET created_at = ? where id = ?`, [
        yesterdayString,
        yesterdayEvent?.id,
    ]);

    const { body } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        activityCountByDate: [
            { date: yesterdayString, count: 1 },
            { date: todayString, count: 2 },
        ],
    });
});

test('project status should return environments with connected SDKs', async () => {
    const flagName = randomId();
    await app.createFeature(flagName);

    const envs =
        await app.services.environmentService.getProjectEnvironments('default');
    expect(envs.some((env) => env.name === 'default')).toBeTruthy();

    const appName = 'blah';
    const environment = 'default';
    await db.stores.clientMetricsStoreV2.batchInsertMetrics([
        {
            featureName: `flag-doesnt-exist`,
            appName,
            environment,
            timestamp: new Date(),
            yes: 5,
            no: 2,
        },
        {
            featureName: flagName,
            appName: `web2`,
            environment,
            timestamp: new Date(),
            yes: 5,
            no: 2,
        },
        {
            featureName: flagName,
            appName,
            environment: 'not-a-real-env',
            timestamp: new Date(),
            yes: 2,
            no: 2,
        },
    ]);

    const { body } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.resources.connectedEnvironments).toBe(1);
});

test('project resources should contain the right data', async () => {
    const { body: noResourcesBody } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(noResourcesBody.resources).toMatchObject({
        members: 0,
        apiTokens: 0,
        segments: 0,
        connectedEnvironments: 0,
    });

    const flagName = randomId();
    await app.createFeature(flagName);

    const environment = 'default';
    await db.stores.clientMetricsStoreV2.batchInsertMetrics([
        {
            featureName: flagName,
            appName: `web2`,
            environment,
            timestamp: new Date(),
            yes: 5,
            no: 2,
        },
    ]);

    await app.services.apiTokenService.createApiTokenWithProjects({
        tokenName: 'test-token',
        projects: ['default'],
        type: ApiTokenType.CLIENT,
        environment: 'default',
    });

    await app.services.segmentService.create(
        {
            name: 'test-segment',
            project: 'default',
            constraints: [],
        },
        {} as IAuditUser,
    );

    const admin = await app.services.userService.createUser({
        username: 'admin',
        rootRole: RoleName.ADMIN,
    });
    const user = await app.services.userService.createUser({
        username: 'test-user',
        rootRole: RoleName.EDITOR,
    });

    await app.services.projectService.addAccess('default', [4], [], [user.id], {
        ...admin,
        ip: '',
    } as IAuditUser);

    const { body } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.resources).toMatchObject({
        members: 1,
        apiTokens: 1,
        segments: 1,
        connectedEnvironments: 1,
    });
});

test('project health should be correct average', async () => {
    await insertHealthScore('2024-04', 100);

    await insertHealthScore('2024-05', 0);
    await insertHealthScore('2024-06', 0);
    await insertHealthScore('2024-07', 90);
    await insertHealthScore('2024-08', 70);

    const { body } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.averageHealth).toBe(40);
});
