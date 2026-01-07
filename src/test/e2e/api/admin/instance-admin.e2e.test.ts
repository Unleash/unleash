import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';
import type { IUnleashStores } from '../../../../lib/types/index.js';
import { ApiTokenType } from '../../../../lib/types/model.js';
import { registerPrometheusMetrics } from '../../../../lib/metrics.js';
import { DEFAULT_ENV } from '../../../../lib/server-impl.js';

let app: IUnleashTest;
let db: ITestDb;
let stores: IUnleashStores;
let refreshDbMetrics: () => Promise<void>;

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

    const { collectAggDbMetrics } = registerPrometheusMetrics(
        app.config,
        stores,
        undefined as unknown as string,
        app.config.eventBus,
        app.services.instanceStatsService,
    );
    refreshDbMetrics = collectAggDbMetrics;
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

    await refreshDbMetrics();

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
        environment: DEFAULT_ENV,
        projects: ['*'],
    });
    await app.services.apiTokenService.createApiTokenWithProjects({
        tokenName: 'client',
        type: ApiTokenType.BACKEND,
        environment: DEFAULT_ENV,
        projects: ['*'],
    });

    const { body } = await app.request
        .get('/api/admin/instance-admin/statistics')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body).toMatchObject({
        apiTokens: { backend: 1, admin: 1, frontend: 1 },
    });

    const { text: csv } = await app.request
        .get('/api/admin/instance-admin/statistics/csv')
        .expect('Content-Type', /text\/csv/)
        .expect(200);

    expect(csv).toMatch(/{""admin"":1,""frontend"":1,""backend"":1}/);
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
                '13399adbb553c360f4c9ac1ea889cd2b89804e5ac498da8b4e3de2ef90649dd9',
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
