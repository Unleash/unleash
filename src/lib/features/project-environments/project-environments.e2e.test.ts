import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { DEFAULT_ENV } from '../../util/index.js';

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
    expect(envs).toHaveLength(3); // test + development + production
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
            `/api/admin/projects/default/environments/${DEFAULT_ENV}/default-strategy`,
        )
        .send(defaultStrategy)
        .expect(200);

    const envs =
        await db.stores.projectStore.getEnvironmentsForProject('default');

    expect(envs).toHaveLength(1);
    expect(envs[0]).toStrictEqual({
        environment: DEFAULT_ENV,
        defaultStrategy,
    });
    const { body } = await app.getRecordedEvents();
    expect(body.events[0]).toMatchObject({
        type: 'default-strategy-updated',
        project: 'default',
        environment: DEFAULT_ENV,
        data: defaultStrategy,
        preData: null,
    });
});

test('Should throw an error if you try to set defaultStrategy other than flexibleRollout', async () => {
    await app.request
        .post(
            `/api/admin/projects/default/environments/${DEFAULT_ENV}/default-strategy`,
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
            environment: DEFAULT_ENV,
        })
        .expect(404);
});
