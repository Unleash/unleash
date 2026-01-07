import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../test/fixtures/no-logger.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('projects_insights', getLogger);
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
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('project insights happy path', async () => {
    const { body } = await app.request
        .get('/api/admin/projects/default/insights')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        stats: {
            avgTimeToProdCurrentWindow: 0,
            createdCurrentWindow: 0,
            createdPastWindow: 0,
            archivedCurrentWindow: 0,
            archivedPastWindow: 0,
            projectActivityCurrentWindow: 0,
            projectActivityPastWindow: 0,
            projectMembersAddedCurrentWindow: 0,
        },
        leadTime: { features: [], projectAverage: 0 },
        featureTypeCounts: [],
        health: {
            activeCount: 0,
            potentiallyStaleCount: 0,
            staleCount: 0,
            rating: 100,
        },
    });
});
