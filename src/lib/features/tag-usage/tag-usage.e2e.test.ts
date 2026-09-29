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

const OTHER_PROJECT = 'tag-usage-other';

beforeAll(async () => {
    db = await dbInit('tag_usage_api_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    tagManagementViaUi: true,
                },
            },
        },
        db.rawDatabase,
    );
    await db.stores.projectStore.create({
        id: OTHER_PROJECT,
        name: 'Other',
        description: '',
        mode: 'open' as const,
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

const createTagType = (name: string) =>
    app.request
        .post('/api/admin/tag-types')
        .send({ name })
        .set('Content-Type', 'application/json')
        .expect(201);

const createTag = (type: string, value: string) =>
    app.request
        .post('/api/admin/tags')
        .send({ type, value })
        .set('Content-Type', 'application/json')
        .expect(201);

const seedTeamTags = async (type: string) => {
    await createTagType(type);
    await app.createFeature(`${type}-active`);
    await app.createFeature(`${type}-archived`);
    await app.createFeature(`${type}-other-archived`, OTHER_PROJECT);

    await app.addTag(`${type}-active`, { type, value: 'payments' });
    await app.addTag(`${type}-archived`, { type, value: 'payments' });
    await app.addTag(`${type}-other-archived`, { type, value: 'checkout' });

    await createTag(type, 'unused');
    await app.archiveFeature(`${type}-archived`);
    await app.archiveFeature(`${type}-other-archived`, OTHER_PROJECT);
};

test('counts values and projects with active or archived flags per tag type', async () => {
    await seedTeamTags('team');

    const { body } = await app.request.get('/api/admin/tag-types').expect(200);

    expect(body.tagTypes.find(({ name }) => name === 'team')).toMatchObject({
        valueCount: 3,
        usedInProjects: 2,
    });
});

test('reports zero values and projects for an unused tag type', async () => {
    await createTagType('empty');

    const { body } = await app.request.get('/api/admin/tag-types').expect(200);

    expect(body.tagTypes.find(({ name }) => name === 'empty')).toMatchObject({
        valueCount: 0,
        usedInProjects: 0,
    });
});
