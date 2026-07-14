import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../test/fixtures/no-logger.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('flag_creators', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    flagListCreatedByFilter: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
    await db.stores.userStore.deleteAll();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns distinct creators from every accessible project, excluding archived flags', async () => {
    const { body: creatorA } = await app.request
        .post(`/auth/demo/login`)
        .send({ email: 'creator-a@getunleash.io' })
        .expect(200);
    const otherProject = await app.services.projectService.createProject(
        { name: 'other' },
        creatorA,
        { id: creatorA.id, username: creatorA.email, ip: '127.0.0.1' },
    );
    await app.createFeature('flag-a-default');
    await app.createFeature('flag-a-other', otherProject.id);

    await app.request
        .post(`/auth/demo/login`)
        .send({ email: 'creator-b@getunleash.io' })
        .expect(200);
    await app.createFeature('flag-b-default');

    await app.request
        .post(`/auth/demo/login`)
        .send({ email: 'creator-archived@getunleash.io' })
        .expect(200);
    await app.createFeature('flag-archived');
    await app.archiveFeature('flag-archived');

    const { body } = await app.request
        .get('/api/admin/flag-creators')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.total).toBe(2);
    expect(body.flagCreators).toEqual(
        expect.arrayContaining([
            { id: expect.any(Number), name: 'creator-a@getunleash.io' },
            { id: expect.any(Number), name: 'creator-b@getunleash.io' },
        ]),
    );
    expect(body.flagCreators).toHaveLength(2);
});

test('matches creators by substring on query', async () => {
    await app.request
        .post(`/auth/demo/login`)
        .send({ email: 'alice@x.io' })
        .expect(200);
    await app.createFeature('flag-alice');

    await app.request
        .post(`/auth/demo/login`)
        .send({ email: 'bob@x.io' })
        .expect(200);
    await app.createFeature('flag-bob');

    const { body: matched } = await app.request
        .get('/api/admin/flag-creators?q=ali')
        .expect(200);

    expect(matched.total).toBe(1);
    expect(matched.flagCreators).toEqual([
        { id: expect.any(Number), name: 'alice@x.io' },
    ]);

    const { body: shortQuery } = await app.request
        .get('/api/admin/flag-creators?q=a')
        .expect(200);

    expect(shortQuery.total).toBe(1);
    expect(shortQuery.flagCreators).toEqual([
        { id: expect.any(Number), name: 'alice@x.io' },
    ]);
});
