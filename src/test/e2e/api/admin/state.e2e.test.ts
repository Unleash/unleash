import dbInit, { ITestDb } from '../../helpers/database-init';
import { IUnleashTest, setupApp } from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';

const importData = require('../../../examples/import.json');

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('state_api_serial', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('exports strategies and features as json by default', async () => {
    expect.assertions(2);

    return app.request
        .get('/api/admin/state/export')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect('features' in res.body).toBe(true);
            expect('strategies' in res.body).toBe(true);
        });
});

test('exports strategies and features as yaml', async () => {
    expect.assertions(0);

    return app.request
        .get('/api/admin/state/export?format=yaml')
        .expect('Content-Type', /yaml/)
        .expect(200);
});

test('exports only features as yaml', async () => {
    expect.assertions(0);

    return app.request
        .get('/api/admin/state/export?format=yaml&featureToggles=1')
        .expect('Content-Type', /yaml/)
        .expect(200);
});

test('exports strategies and features as attachment', async () => {
    expect.assertions(0);

    return app.request
        .get('/api/admin/state/export?download=1')
        .expect('Content-Type', /json/)
        .expect('Content-Disposition', /attachment/)
        .expect(200);
});

test('imports strategies and features', async () => {
    expect.assertions(0);

    return app.request
        .post('/api/admin/state/import')
        .send(importData)
        .expect(202);
});

test('does not not accept gibberish', async () => {
    expect.assertions(0);

    return app.request
        .post('/api/admin/state/import')
        .send({ features: 'nonsense' })
        .expect(400);
});

test('imports strategies and features from json file', async () => {
    expect.assertions(0);

    return app.request
        .post('/api/admin/state/import')
        .attach('file', 'src/test/examples/import.json')
        .expect(202);
});

test('imports strategies and features from yaml file', async () => {
    expect.assertions(0);

    return app.request
        .post('/api/admin/state/import')
        .attach('file', 'src/test/examples/import.yml')
        .expect(202);
});

test('import works for 3.17 json format', async () => {
    await app.request
        .post('/api/admin/state/import')
        .attach('file', 'src/test/examples/exported3176.json')
        .expect(202);
});

test('import works for 3.17 enterprise json format', async () => {
    await app.request
        .post('/api/admin/state/import')
        .attach('file', 'src/test/examples/exported-3175-enterprise.json')
        .expect(202);
});
test('import works for 4.0 enterprise format', async () => {
    await app.request
        .post('/api/admin/state/import')
        .attach('file', 'src/test/examples/exported405-enterprise.json')
        .expect(202);
});

test('import for 4.1.2 enterprise format fails', async () => {
    await expect(async () =>
        app.request
            .post('/api/admin/state/import')
            .attach('file', 'src/test/examples/exported412-enterprise.json')
            .expect(202),
    ).rejects;
});

test('import for 4.1.2 enterprise format fixed works', async () => {
    await app.request
        .post('/api/admin/state/import')
        .attach(
            'file',
            'src/test/examples/exported412-enterprise-necessary-fixes.json',
        )
        .expect(202);
});

test('Can roundtrip. I.e. export and then import', async () => {
    const projectId = 'export-project';
    const environmentId = 'export-environment';
    const userName = 'export-user';
    const featureName = 'export.feature';
    await db.stores.environmentStore.create({
        name: environmentId,
        type: 'test',
        displayName: 'Environment for export',
    });
    await db.stores.projectStore.create({
        name: projectId,
        id: projectId,
        description: 'Project for export',
    });
    await app.services.environmentService.addEnvironmentToProject(
        environmentId,
        projectId,
    );
    await app.services.featureToggleServiceV2.createFeatureToggle(
        projectId,
        {
            type: 'Release',
            name: featureName,
            description: 'Feature for export',
        },
        userName,
    );
    await app.services.featureToggleServiceV2.createStrategy(
        {
            name: 'default',
            constraints: [
                { contextName: 'userId', operator: 'IN', values: ['123'] },
            ],
            parameters: {},
        },
        projectId,
        featureName,
        environmentId,
    );
    const data = await app.services.stateService.export({});
    await app.services.stateService.import({
        data,
        dropBeforeImport: true,
        keepExisting: false,
        userName: 'export-tester',
    });
});
