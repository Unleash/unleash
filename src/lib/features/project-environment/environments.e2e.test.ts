import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import { DEFAULT_ENV } from '../../util';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('project_environments_api_serial', getLogger);
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

afterEach(async () => {
    const all =
        await db.stores.projectStore.getEnvironmentsForProject('default');
    await Promise.all(
        all
            .filter((env) => env.environment !== DEFAULT_ENV)
            .map(async (env) =>
                db.stores.projectStore.deleteEnvironmentForProject(
                    'default',
                    env.environment,
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

    const envs =
        await db.stores.projectStore.getEnvironmentsForProject('default');

    const environment = envs.find((env) => env.environment === 'test');

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

    const envs =
        await db.stores.projectStore.getEnvironmentsForProject('default');

    expect(envs).toHaveLength(1);
});

test('Should not remove environment from project if project only has one environment enabled', async () => {
    await app.request
        .delete(`/api/admin/projects/default/environments/default`)
        .expect(400)
        .expect((r) => {
            expect(r.body.details[0].description).toBe(
                'You must always have one active environment',
            );
        });

    const envs =
        await db.stores.projectStore.getEnvironmentsForProject('default');

    expect(envs).toHaveLength(1);
});

test('Should add default strategy to environment', async () => {
    const defaultStrategy = {
        name: 'flexibleRollout',
        constraints: [],
        parameters: {
            rollout: '50',
            stickiness: 'customAppName',
            groupId: 'stickytoggle',
        },
    };

    await app.request
        .post(
            `/api/admin/projects/default/environments/default/default-strategy`,
        )
        .send(defaultStrategy)
        .expect(200);

    const envs =
        await db.stores.projectStore.getEnvironmentsForProject('default');

    expect(envs).toHaveLength(1);
    expect(envs[0]).toStrictEqual({
        environment: 'default',
        defaultStrategy,
    });
    const { body } = await app.getRecordedEvents();
    expect(body.events[0]).toMatchObject({
        type: 'default-strategy-updated',
        project: 'default',
        environment: 'default',
        data: defaultStrategy,
        preData: null,
    });
});

test('Should throw an error if you try to set defaultStrategy other than flexibleRollout', async () => {
    await app.request
        .post(
            `/api/admin/projects/default/environments/default/default-strategy`,
        )
        .send({
            name: 'default',
            constraints: [],
            parameters: {},
        })
        .expect(400);
});

test('Add environment to project should return 404 when given a projectid that does not exist', async () => {
    await app.request
        .post(`/api/admin/projects/unknown/environments`)
        .send({
            environment: 'default',
        })
        .expect(404);
});
