import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../../test/fixtures/no-logger.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('archive_test_serial', getLogger);
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

test('Should be allowed to reuse deleted toggle name', async () => {
    await app.request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'ts.really.delete',
            archived: true,
        })
        .expect(201);
    await app.request
        .post('/api/admin/features/validate')
        .send({ name: 'ts.really.delete' })
        .expect(409);
    await app.request.delete('/api/admin/archive/ts.really.delete').expect(200);
    await app.request
        .post('/api/admin/features/validate')
        .send({ name: 'ts.really.delete' })
        .expect(200);
});

test('Should get archived toggles via project', async () => {
    await db.stores.featureToggleStore.deleteAll();

    const proj1 = 'proj-1';
    const proj2 = 'proj-2';

    await db.stores.projectStore.create({
        id: proj1,
        name: proj1,
        description: '',
        mode: 'open' as const,
    });
    await db.stores.projectStore.create({
        id: proj2,
        name: proj2,
        description: '',
        mode: 'open' as const,
    });

    await db.stores.featureToggleStore.create(proj1, {
        name: 'feat-proj-1',
        archived: true,
        createdByUserId: 9999,
    });
    await db.stores.featureToggleStore.create(proj2, {
        name: 'feat-proj-2',
        archived: true,
        createdByUserId: 9999,
    });
    await db.stores.featureToggleStore.create(proj2, {
        name: 'feat-proj-2-2',
        archived: true,
        createdByUserId: 9999,
    });

    await app.request
        .get(
            `/api/admin/search/features?project=IS%3A${proj1}&archived=IS%3Atrue`,
        )
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.features).toHaveLength(1);
        });

    await app.request
        .get(
            `/api/admin/search/features?project=IS%3A${proj2}&archived=IS%3Atrue`,
        )
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.features).toHaveLength(2);
        });
});

test('Should be able to revive toggle', async () => {
    await app.request.post('/api/admin/projects/default/features').send({
        name: 'archived.revival',
        archived: true,
    });
    await app.request
        .post('/api/admin/archive/revive/archived.revival')
        .send({})
        .expect(200);
});

test('Should disable all environments when reviving a toggle', async () => {
    await db.stores.featureToggleStore.deleteAll();
    await db.stores.featureToggleStore.create('default', {
        name: 'feat-proj-1',
        archived: true,
        createdByUserId: 9999,
    });
    await db.stores.featureEnvironmentStore.addEnvironmentToFeature(
        'feat-proj-1',
        'production',
        true,
    );
    await db.stores.featureEnvironmentStore.addEnvironmentToFeature(
        'feat-proj-1',
        'development',
        true,
    );
    await app.request
        .post('/api/admin/archive/revive/feat-proj-1')
        .send({})
        .expect(200);

    const { body } = await app.request
        .get(
            '/api/admin/projects/default/features/feat-proj-1?variantEnvironments=true',
        )
        .expect(200);

    expect(body.environments.every((env) => !env.enabled));
});

test('Reviving a non-existing toggle should yield 404', async () => {
    await app.request
        .post('/api/admin/archive/revive/non.existing')
        .send({})
        .expect(404);
});
