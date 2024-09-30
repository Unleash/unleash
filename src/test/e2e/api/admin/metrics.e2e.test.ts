import dbInit, { type ITestDb } from '../../helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';
import { ApiTokenType } from '../../../../lib/types/models/api-token';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('metrics_serial', getLogger, {
        experimental: {
            flags: {},
        },
    });
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

beforeEach(async () => {
    await app.services.clientInstanceService.createApplication({
        appName: 'demo-app-1',
        strategies: ['default'],
        //@ts-ignore
        announced: true,
    });
    await app.services.clientInstanceService.createApplication({
        appName: 'demo-app-2',
        strategies: ['default', 'extra'],
        description: 'hello',
        //@ts-ignore
        announced: true,
    });
    await app.services.clientInstanceService.createApplication({
        appName: 'deletable-app',
        strategies: ['default'],
        description: 'Some desc',
        //@ts-ignore
        announced: true,
    });

    await db.stores.clientInstanceStore.insert({
        appName: 'demo-app-1',
        instanceId: 'test-1',
    });
    await db.stores.clientInstanceStore.insert({
        appName: 'demo-seed-2',
        instanceId: 'test-2',
    });
    await db.stores.clientInstanceStore.insert({
        appName: 'deletable-app',
        instanceId: 'inst-1',
    });

    await app.services.clientInstanceService.createApplication({
        appName: 'usage-app',
        strategies: ['default'],
        description: 'Some desc',
        projects: ['default'],
        environment: 'dev',
    });
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

afterEach(async () => {
    await db.reset();
});

test('should get application details', async () => {
    return app.request
        .get('/api/admin/metrics/applications/demo-app-1')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.appName).toBe('demo-app-1');
            expect(res.body.instances).toHaveLength(1);
        });
});

test('should get list of applications', async () => {
    expect.assertions(1);
    return app.request
        .get('/api/admin/metrics/applications')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.applications).toHaveLength(4);
        });
});

test('should delete application', async () => {
    expect.assertions(2);
    await app.request
        .delete('/api/admin/metrics/applications/deletable-app')
        .expect((res) => {
            expect(res.status).toBe(200);
        });
    return app.request
        .get('/api/admin/metrics/applications')
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.applications).toHaveLength(3);
        });
});

test('deleting an application should be idempotent, so expect 200', async () => {
    expect.assertions(1);
    return app.request
        .delete('/api/admin/metrics/applications/unknown')
        .expect((res) => {
            expect(res.status).toBe(200);
        });
});

test('should get list of application usage', async () => {
    const { body } = await app.request
        .get('/api/admin/metrics/applications')
        .expect('Content-Type', /json/)
        .expect(200);
    const application = body.applications.find(
        (selectableApp) => selectableApp.appName === 'usage-app',
    );
    expect(application).toMatchObject({
        appName: 'usage-app',
        usage: [
            {
                project: 'default',
                environments: ['dev'],
            },
        ],
    });
});

test('should save multiple projects from token', async () => {
    await db.reset();
    await db.stores.projectStore.create({
        id: 'mainProject',
        name: 'mainProject',
    });

    const multiProjectToken =
        await app.services.apiTokenService.createApiTokenWithProjects({
            type: ApiTokenType.CLIENT,
            projects: ['default', 'mainProject'],
            environment: 'default',
            tokenName: 'tester',
        });

    await app.request
        .post('/api/client/register')
        .set('Authorization', multiProjectToken.secret)
        .send({
            appName: 'multi-project-app',
            instanceId: 'instance-1',
            strategies: ['default'],
            started: Date.now(),
            interval: 10,
        });

    await app.services.clientInstanceService.bulkAdd();

    const { body } = await app.request
        .get('/api/admin/metrics/applications')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        applications: [
            {
                appName: 'multi-project-app',
                usage: [
                    {
                        environments: ['default'],
                        project: 'default',
                    },
                    {
                        environments: ['default'],
                        project: 'mainProject',
                    },
                ],
            },
        ],
        total: 1,
    });
});
