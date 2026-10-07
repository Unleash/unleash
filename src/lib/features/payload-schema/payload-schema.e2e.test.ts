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
    db = await dbInit('payload_schema', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        { experimental: { flags: { payloadSchemas: true } } },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('a payload schema can only be set through the project the flag is in', async () => {
    await app.createFeature('my-flag', 'default');
    await db.stores.projectStore.create({
        id: 'other-project',
        name: 'Other project',
    });

    const throughOtherProject = await app.request
        .put(
            '/api/admin/projects/other-project/features/my-flag/payload-schema',
        )
        .send({ schema: {} });
    const throughOwnProject = await app.request
        .put('/api/admin/projects/default/features/my-flag/payload-schema')
        .send({ schema: {} });

    expect(throughOtherProject.status).toBe(404);
    expect(throughOwnProject.status).toBe(204);
});
