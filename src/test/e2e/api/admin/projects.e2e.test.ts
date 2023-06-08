import dbInit, { ITestDb } from '../../helpers/database-init';
import { IUnleashTest, setupApp } from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';
let db: ITestDb;
let app: IUnleashTest;

beforeAll(async () => {
    db = await dbInit('projects_api_serial', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('response should include created_at', async () => {
    const { body } = await app.request
        .get('/api/admin/projects')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.projects[0].createdAt).toBeDefined();
});

test('response for default project should include created_at', async () => {
    const { body } = await app.request
        .get('/api/admin/projects/default')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.createdAt).toBeDefined();
});
