import dbInit, { ITestDb } from '../../../helpers/database-init';
import { IUnleashTest, setupApp } from '../../../helpers/test-helper';
import getLogger from '../../../../fixtures/no-logger';
import { DEFAULT_ENV } from '../../../../../lib/util/constants';

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
            .filter((env) => env !== DEFAULT_ENV)
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
    // Endpoint to create env does not exists anymore
    await db.stores.environmentStore.create({
        name: 'test',
        type: 'test',
    });
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

test('Should remove environment from project', async () => {
    const name = 'test-delete';
    // Endpoint to create env does not exists anymore

    await db.stores.environmentStore.create({
        name,
        type: 'test',
    });

    // Endpoint to delete project does not exist anymore
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

test('Should not remove environment from project if project only has one environment enabled', async () => {
    await app.request
        .delete(`/api/admin/projects/default/environments/default`)
        .expect(400)
        .expect((r) => {
            expect(r.body.details[0].message).toBe(
                'You must always have one active environment',
            );
        });

    const envs = await db.stores.projectStore.getEnvironmentsForProject(
        'default',
    );

    expect(envs).toHaveLength(1);
});
