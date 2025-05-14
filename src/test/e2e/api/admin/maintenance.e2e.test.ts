import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    setupApp,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';

let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('maintenance_api_serial', getLogger);
});

afterEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
});

afterAll(async () => {
    await db.destroy();
});

test('should not allow to create feature flags in maintenance mode', async () => {
    const appWithMaintenanceMode = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                maintenanceMode: true,
            },
        },
    });

    return appWithMaintenanceMode.request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'maintenance-feature',
        })
        .set('Content-Type', 'application/json')
        .expect(503);
});

test('maintenance mode is off by default', async () => {
    const appWithMaintenanceMode = await setupAppWithCustomConfig(
        db.stores,
        {},
        db.rawDatabase,
    );

    return appWithMaintenanceMode.request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'maintenance-feature1',
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('should go into maintenance mode, when user has set it', async () => {
    const appWithMaintenanceMode = await setupApp(db.stores);

    await appWithMaintenanceMode.request
        .post('/api/admin/maintenance')
        .send({
            enabled: true,
        })
        .set('Content-Type', 'application/json')
        .expect(204);

    return appWithMaintenanceMode.request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'maintenance-feature1',
        })
        .set('Content-Type', 'application/json')
        .expect(503);
});
test('maintenance mode flag should take precedence over maintenance mode setting', async () => {
    const appWithMaintenanceMode = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                maintenanceMode: true,
            },
        },
    });

    await appWithMaintenanceMode.request
        .post('/api/admin/maintenance')
        .send({
            enabled: false,
        })
        .set('Content-Type', 'application/json')
        .expect(204);

    return appWithMaintenanceMode.request
        .post('/api/admin/projects/default/features')
        .send({
            name: 'maintenance-feature1',
        })
        .set('Content-Type', 'application/json')
        .expect(503);
});
