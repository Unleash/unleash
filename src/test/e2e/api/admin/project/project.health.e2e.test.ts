import dbInit, { type ITestDb } from '../../../helpers/database-init.js';
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
    db = await dbInit('project_health_api_serial', getLogger, {
        dbInitMethod: 'legacy' as const,
    });
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

test('Project with no stale toggles should have 100% health rating', async () => {
    const project = {
        id: 'fresh',
        name: 'Health rating',
        description: 'Fancy',
    };
    await app.services.projectService.createProject(
        project,
        user,
        extractAuditInfoFromUser(user),
    );
    await app.request
        .post('/api/admin/projects/fresh/features')
        .send({
            name: 'health-rating-not-stale',
            description: 'new',
            stale: false,
        })
        .expect(201);
    await app.request
        .post('/api/admin/projects/fresh/features')
        .send({
            name: 'health-rating-not-stale-2',
            description: 'new too',
            stale: false,
        })
        .expect(201);
    await app.request
        .get('/api/admin/projects/fresh')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.health).toBe(100);
            expect(res.body.environments).toHaveLength(1);
            expect(res.body.environments).toStrictEqual([
                { environment: 'default' },
            ]);
        });
});

test('Sorts environments by sort order', async () => {
    const envOne = 'my-sorted-env1';
    const envTwo = 'my-sorted-env2';
    const featureName = 'My-new-toggle';
    const defaultEnvName = 'default';
    await db.stores.environmentStore.create({
        name: envOne,
        type: 'production',
        sortOrder: 0,
    });

    await db.stores.environmentStore.create({
        name: envTwo,
        type: 'production',
        sortOrder: 500,
    });

    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envOne,
        })
        .expect(200);

    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envTwo,
        })
        .expect(200);

    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);

    await app.request.get('/api/admin/projects/default').expect((res) => {
        const feature = res.body.features[0];
        expect(feature.environments[0].name).toBe(envOne);
        expect(feature.environments[1].name).toBe(defaultEnvName);
        expect(feature.environments[2].name).toBe(envTwo);
    });
});

test('Sorts environments correctly if sort order is equal', async () => {
    const envOne = 'my-sorted-env3';
    const envTwo = 'my-sorted-env4';
    const featureName = 'My-new-toggle-2';

    await db.stores.environmentStore.create({
        name: envOne,
        type: 'production',
        sortOrder: -5,
    });

    await db.stores.environmentStore.create({
        name: envTwo,
        type: 'production',
        sortOrder: -5,
    });

    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envOne,
        })
        .expect(200);

    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envTwo,
        })
        .expect(200);

    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);

    await app.request.get('/api/admin/projects/default').expect((res) => {
        const feature = res.body.features[0];
        expect(feature.environments[0].name).toBe(envOne);
        expect(feature.environments[1].name).toBe(envTwo);
    });
});
