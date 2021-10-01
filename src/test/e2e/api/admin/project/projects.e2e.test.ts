import dbInit from '../../../helpers/database-init';
import { setupApp } from '../../../helpers/test-helper';
import getLogger from '../../../../fixtures/no-logger';
import ProjectStore from '../../../../../lib/db/project-store';

let app;
let db;

let projectStore: ProjectStore;

beforeAll(async () => {
    db = await dbInit('projects_api_serial', getLogger);
    app = await setupApp(db.stores);
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
