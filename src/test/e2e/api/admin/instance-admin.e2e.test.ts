import dbInit, { type ITestDb } from '../../helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';
import type { IUnleashStores } from '../../../../lib/types';
import { ApiTokenType } from '../../../../lib/types/models/api-token';

let app: IUnleashTest;
let db: ITestDb;
let stores: IUnleashStores;

beforeAll(async () => {
    db = await dbInit('instance_admin_api_serial', getLogger);
    stores = db.stores;
    await stores.settingStore.insert('instanceInfo', { id: 'test-static' });
    app = await setupAppWithCustomConfig(
        stores,
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

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should return instance statistics', async () => {
    await stores.featureToggleStore.create('default', {
        name: 'TestStats1',
        createdByUserId: 9999,
    });

    return app.request
        .get('/api/admin/instance-admin/statistics')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.featureToggles).toBe(1);
        });
});

test('api tokens are serialized correctly', async () => {
    await app.services.apiTokenService.createApiTokenWithProjects({
        tokenName: 'admin',
        type: ApiTokenType.ADMIN,
        environment: '*',
        projects: ['*'],
    });
    await app.services.apiTokenService.createApiTokenWithProjects({
        tokenName: 'frontend',
        type: ApiTokenType.FRONTEND,
        environment: 'default',
        projects: ['*'],
    });
    await app.services.apiTokenService.createApiTokenWithProjects({
        tokenName: 'client',
        type: ApiTokenType.CLIENT,
        environment: 'default',
        projects: ['*'],
    });

    const { body } = await app.request
        .get('/api/admin/instance-admin/statistics')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        apiTokens: { client: 1, admin: 1, frontend: 1 },
    });

    const { text: csv } = await app.request
        .get('/api/admin/instance-admin/statistics/csv')
        .expect('Content-Type', /text\/csv/)
        .expect(200);

    expect(csv).toMatch(/{""client"":1,""admin"":1,""frontend"":1}/);
});

test('should return instance statistics with correct number of projects', async () => {
    await stores.projectStore.create({
        id: 'test',
        name: 'Test',
        description: 'lorem',
        mode: 'open' as const,
    });

    return app.request
        .get('/api/admin/instance-admin/statistics')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.projects).toBe(2);
        });
});

test('should return signed instance statistics', async () => {
    return app.request
        .get('/api/admin/instance-admin/statistics')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.instanceId).toBe('test-static');
            expect(res.body.sum).toBe(
                '5ba2cb7c3e29f4e5b3382c560b92b837f3603dc7db73a501ec331c7f0ed17bd0',
            );
        });
});

test('should return instance statistics as CSV', async () => {
    await stores.featureToggleStore.create('default', {
        name: 'TestStats2',
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create('default', {
        name: 'TestStats3',
        createdByUserId: 9999,
    });

    const res = await app.request
        .get('/api/admin/instance-admin/statistics/csv')
        .expect('Content-Type', /text\/csv/)
        .expect(200);

    expect(res.text).toMatch(/featureToggles/);
    expect(res.text).toMatch(/"sum"/);
});

test('contains new max* properties', async () => {
    const { body } = await app.request
        .get('/api/admin/instance-admin/statistics')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        maxEnvironmentStrategies: 0,
        maxConstraints: 0,
        maxConstraintValues: 0,
    });
});
