import dbInit from '../../../helpers/database-init';
import { setupAppWithCustomConfig } from '../../../helpers/test-helper';
import getLogger from '../../../../fixtures/no-logger';
import ProjectStore from '../../../../../lib/db/project-store';

let app;
let db;

let projectStore: ProjectStore;

beforeAll(async () => {
    db = await dbInit('projects_api_serial', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    });
    projectStore = db.stores.projectStore;
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('Should ONLY return default project', async () => {
    projectStore.create({ id: 'test2', name: 'test', description: '' });

    const { body } = await app.request
        .get('/api/admin/projects')
        .expect(200)
        .expect('Content-Type', /json/);

    expect(body.projects).toHaveLength(1);
    expect(body.projects[0].id).toBe('default');
});

test('Should store and retrieve default project stickiness', async () => {
    const appWithDefaultStickiness = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                projectScopedStickiness: true,
                strictSchemaValidation: true,
            },
        },
    });
    const reqBody = { stickiness: 'userId' };

    await appWithDefaultStickiness.request
        .post('/api/admin/projects/default/stickiness')
        .send(reqBody)
        .expect(200);

    const { body } = await appWithDefaultStickiness.request
        .get('/api/admin/projects/default/stickiness')
        .expect(200)
        .expect('Content-Type', /json/);

    expect(body).toStrictEqual(reqBody);
});
