import dbInit, { ITestDb } from '../../../helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../helpers/test-helper';
import getLogger from '../../../../fixtures/no-logger';
import ProjectStore from '../../../../../lib/db/project-store';
import { Knex } from 'knex';
import { IProjectStore } from 'lib/types';

let app: IUnleashTest;
let db: ITestDb;

let projectStore: IProjectStore;

beforeAll(async () => {
    db = await dbInit('projects_api_serial', getLogger);
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
    projectStore = db.stores.projectStore;
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('Should ONLY return default project', async () => {
    projectStore.create({
        id: 'test2',
        name: 'test',
        description: '',
        mode: 'open',
    });

    const { body } = await app.request
        .get('/api/admin/projects')
        .expect(200)
        .expect('Content-Type', /json/);

    expect(body.projects).toHaveLength(1);
    expect(body.projects[0].id).toBe('default');
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

test('response should include last seen at per environment', async () => {
    await app.createFeature('my-new-feature-toggle');

    await db.rawDatabase.raw(`
        INSERT INTO last_seen_at_metrics (feature_name, environment, last_seen_at)
        VALUES ('my-new-feature-toggle', 'default', '2023-10-01 12:34:56');
    `);

    await db.rawDatabase.raw(`
        INSERT INTO feature_environments (feature_name, environment, last_seen_at, enabled)
        VALUES ('my-new-feature-toggle', 'default', '2023-05-01 12:34:56', true)
        ON CONFLICT (feature_name, environment) DO UPDATE SET last_seen_at = '2022-05-01 12:34:56', enabled = true;
    `);

    const { body } = await app.request
        .get('/api/admin/projects/default')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.features[0].environments[0].lastSeenAt).toEqual(
        '2022-05-01T12:34:56.000Z',
    );

    const appWithLastSeenRefactor = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    useLastSeenRefactor: true,
                },
            },
        },
        db.rawDatabase,
    );

    const response = await appWithLastSeenRefactor.request
        .get('/api/admin/projects/default')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(response.body.features[0].environments[0].lastSeenAt).toEqual(
        '2023-10-01T12:34:56.000Z',
    );
});
