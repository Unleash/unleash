import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import {
    type IUser,
    RoleName,
    type IAuditUser,
    type IUnleashConfig,
} from '../../types/index.js';
import type { EventService } from '../../services/index.js';
import { createEventsService } from '../events/createEventsService.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import { DEFAULT_ENV, randomId } from '../../util/index.js';
import { ApiTokenType } from '../../types/model.js';
import { FEATURE_CREATED } from '../../events/index.js';

let app: IUnleashTest;
let db: ITestDb;
let eventService: EventService;

const TEST_USER_ID = -9999;
const config: IUnleashConfig = createTestConfig();

const _insertHealthScore = (id: string, health: number) => {
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
    await db.rawDatabase('flag_trends').delete();
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

test('project resources should contain the right data', async () => {
    const { body: noResourcesBody } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(noResourcesBody.resources).toMatchObject({
        members: 0,
        apiTokens: 0,
        segments: 0,
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
        environment: DEFAULT_ENV,
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
    });
});

test('project health contains the current health score', async () => {
    const { body } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.health.current).toBe(100);
});

test('project status contains lifecycle data', async () => {
    const { body } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.lifecycleSummary).toMatchObject({
        initial: {
            averageDays: null,
            currentFlags: 0,
        },
        preLive: {
            averageDays: null,
            currentFlags: 0,
        },
        live: {
            averageDays: null,
            currentFlags: 0,
        },
        completed: {
            averageDays: null,
            currentFlags: 0,
        },
        archived: {
            currentFlags: 0,
            last30Days: 0,
        },
    });
});

test('project status includes stale flags', async () => {
    const otherProject = await app.services.projectService.createProject(
        {
            name: 'otherProject',
            id: randomId(),
        },
        {} as IUser,
        {} as IAuditUser,
    );

    function cartesianProduct(...arrays: any[][]): any[][] {
        return arrays.reduce(
            (acc, array) => {
                return acc.flatMap((accItem) =>
                    array.map((item) => [...accItem, item]),
                );
            },
            [[]] as any[][],
        );
    }

    // of all 16 (2^4) permutations, only 3 are unhealthy flags in a given project.
    const combinations = cartesianProduct(
        [false, true], // stale
        [false, true], // potentially stale
        [false, true], // archived
        ['default', otherProject.id], // project
    );

    for (const [stale, potentiallyStale, archived, project] of combinations) {
        const name = `flag-${project}-stale-${stale}-potentially-stale-${potentiallyStale}-archived-${archived}`;
        await app.createFeature(
            {
                name,
                stale,
            },
            project,
        );
        if (potentiallyStale) {
            await db
                .rawDatabase('features')
                .update('potentially_stale', true)
                .where({ name });
        }
        if (archived) {
            await app.archiveFeature(name, project);
        }
    }

    const { body } = await app.request
        .get('/api/admin/projects/default/status')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.staleFlags).toMatchObject({
        total: 3,
    });
});
