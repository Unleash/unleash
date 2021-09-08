import dbInit, { ITestDb } from '../../../helpers/database-init';
import { IUnleashTest, setupApp } from '../../../helpers/test-helper';
import getLogger from '../../../../fixtures/no-logger';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('project_environments_api_serial', getLogger);
    app = await setupApp(db.stores);
});

afterEach(async () => {
    const all = await db.stores.projectStore.getEnvironmentsForProject(
        'default',
    );
    await Promise.all(
        all
            .filter((env) => env !== ':global:')
            .map(async (env) =>
                db.stores.projectStore.deleteEnvironmentForProject(
                    'default',
                    env,
                ),
            ),
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('Should add environment to project', async () => {
    await app.request
        .post('/api/admin/environments')
        .send({ name: 'test', displayName: 'Test Env' })
        .set('Content-Type', 'application/json')
        .expect(201);
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({ environment: 'test' })
        .expect(200);

    const envs = await db.stores.projectStore.getEnvironmentsForProject(
        'default',
    );

    const environment = envs.find((env) => env === 'test');

    expect(environment).toBeDefined();
    expect(envs).toHaveLength(2);
});

test('Should validate environment', async () => {
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({ name: 'test' })
        .expect(400);
});

test('Should remove environment to project', async () => {
    const name = 'test-delete';
    await app.request
        .post('/api/admin/environments')
        .send({ name, displayName: 'Test Env' })
        .set('Content-Type', 'application/json')
        .expect(201);
    await app.request
        .post('/api/admin/projects/default/environments')
        .send({ environment: name })
        .expect(200);

    await app.request
        .delete(`/api/admin/projects/default/environments/${name}`)
        .expect(200);

    const envs = await db.stores.projectStore.getEnvironmentsForProject(
        'default',
    );

    expect(envs).toHaveLength(1);
});
