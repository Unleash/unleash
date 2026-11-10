import dbInit, { type ITestDb } from '../../../helpers/database-init.js';
import { subDays } from 'date-fns';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../helpers/test-helper.js';
import getLogger from '../../../../fixtures/no-logger.js';
import type { IUser } from '../../../../../lib/types/index.js';
import { extractAuditInfoFromUser } from '../../../../../lib/util/index.js';

let app: IUnleashTest;
let db: ITestDb;
let user: IUser;

beforeAll(async () => {
    db = await dbInit('project_health_api_serial', getLogger);
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
    user = await db.stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

const createProject = async (id: string) => {
    const project = { id, name: 'Health rating', description: 'Fancy' };
    await app.services.projectService.createProject(
        project,
        user,
        extractAuditInfoFromUser(user),
    );
    return id;
};

const createFlags = async (projectId: string, flags: object[]) => {
    for (const flag of flags) {
        await app.request
            .post(`/api/admin/projects/${projectId}/features`)
            .send(flag)
            .expect(201);
    }
};

const getHealthReport = async (projectId: string) => {
    const { body } = await app.request
        .get(`/api/admin/projects/${projectId}/health-report`)
        .expect(200)
        .expect('Content-Type', /json/);
    return body;
};

test('Project with no stale toggles should have 100% health rating', async () => {
    const projectId = await createProject('fresh');
    await createFlags(projectId, [
        { name: 'health-rating-not-stale', description: 'new', stale: false },
        {
            name: 'health-rating-not-stale-2',
            description: 'new too',
            stale: false,
        },
    ]);

    expect(await getHealthReport(projectId)).toMatchObject({ health: 100 });
});

test('Health rating endpoint yields stale, potentially stale and active count on top of health', async () => {
    const projectId = await createProject('test-health');
    const activeFlags = [
        { name: 'health-report-new', description: 'new', stale: false },
        { name: 'health-report-new-2', description: 'new too', stale: false },
    ];
    const staleFlags = [
        { name: 'health-report-stale', description: 'new too', stale: true },
    ];
    await createFlags(projectId, [...activeFlags, ...staleFlags]);

    await app.services.projectHealthService.setProjectHealthRating(projectId);

    expect(await getHealthReport(projectId)).toMatchObject({
        health: 67,
        activeCount: activeFlags.length,
        staleCount: staleFlags.length,
        potentiallyStaleCount: 0,
    });
});

test('Health rating endpoint does not include archived toggles when calculating potentially stale toggles', async () => {
    const projectId = await createProject('potentially-stale-archived');
    const flagsWithinTheirLifetime = [
        {
            name: 'potentially-stale-archive-fresh',
            description: 'new',
            stale: false,
        },
        {
            name: 'potentially-stale-archive-fresh-2',
            description: 'new too',
            stale: false,
        },
    ];
    const flagsMarkedStale = [
        {
            name: 'potentially-stale-archive-stale',
            description: 'stale',
            stale: true,
        },
    ];
    const flagsPastTheirLifetime = [
        {
            name: 'potentially-archive-stale',
            description: 'Really Old',
            createdAt: new Date(2019, 5, 1),
        },
    ];
    const archivedFlags = [
        {
            name: 'potentially-archive-stale-archived',
            description: 'Really Old',
            createdAt: new Date(2019, 5, 1),
            archived: true,
        },
    ];
    await createFlags(projectId, [
        ...flagsWithinTheirLifetime,
        ...flagsMarkedStale,
        ...flagsPastTheirLifetime,
        ...archivedFlags,
    ]);

    await app.services.featureToggleService.updatePotentiallyStaleFeatures(); // the scheduler runs this every minute
    await app.services.projectHealthService.setProjectHealthRating(projectId);

    expect(await getHealthReport(projectId)).toMatchObject({
        health: 50,
        activeCount:
            flagsWithinTheirLifetime.length + flagsPastTheirLifetime.length,
        staleCount: flagsMarkedStale.length,
        potentiallyStaleCount: flagsPastTheirLifetime.length,
    });
});

test('Health rating endpoint correctly handles potentially stale toggles', async () => {
    const projectId = await createProject('potentially-stale');
    const flagsWithinTheirLifetime = [
        { name: 'potentially-stale-fresh', description: 'new', stale: false },
        {
            name: 'potentially-stale-fresh-2',
            description: 'new too',
            stale: false,
        },
        {
            name: 'never-stale-by-own-lifetime',
            description:
                'Past the lifetime of its type, but the flag never expires',
            type: 'release',
            lifetimeDays: 0,
            createdAt: subDays(new Date(), 41),
        },
    ];
    const flagsMarkedStale = [
        { name: 'potentially-stale-stale', description: 'stale', stale: true },
    ];
    const flagsPastTheirLifetime = [
        {
            name: 'potentially-stale',
            description: 'Really Old',
            createdAt: new Date(2019, 5, 1),
        },
        {
            name: 'potentially-stale-by-own-lifetime',
            description: 'Past its own lifetime, but its type never expires',
            type: 'kill-switch',
            lifetimeDays: 7,
            createdAt: subDays(new Date(), 8),
        },
    ];
    await createFlags(projectId, [
        ...flagsWithinTheirLifetime,
        ...flagsMarkedStale,
        ...flagsPastTheirLifetime,
    ]);

    await app.services.featureToggleService.updatePotentiallyStaleFeatures(); // the scheduler runs this every minute
    await app.services.projectHealthService.setProjectHealthRating(projectId);

    expect(await getHealthReport(projectId)).toMatchObject({
        health: 50,
        activeCount:
            flagsWithinTheirLifetime.length + flagsPastTheirLifetime.length,
        staleCount: flagsMarkedStale.length,
        potentiallyStaleCount: flagsPastTheirLifetime.length,
    });
});

test('Health report for non-existing project yields 404', async () => {
    await app.request
        .get('/api/admin/projects/some-crazy-project-name/health-report')
        .expect(404);
});

test('Update update_at when setHealth runs', async () => {
    await app.services.projectHealthService.setProjectHealthRating('default');
    await app.request
        .get('/api/admin/projects/default/health-report')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            const now = Date.now();
            const updatedAt = new Date(res.body.updatedAt).getTime();
            expect(now - updatedAt).toBeLessThan(5000);
        });
});
