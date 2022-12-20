import dbInit, { ITestDb } from '../../helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('maintenance_api_serial', getLogger);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should have access to the get all features endpoint even if api is disabled', async () => {
    const appWithDisabledLegacyFeatures = await setupAppWithCustomConfig(
        db.stores,
        {
            disableLegacyFeaturesApi: true,
        },
    );

    await appWithDisabledLegacyFeatures.request
        .get('/api/admin/features')
        .expect(200);
});

test('should not allow creation of feature toggle in maintenance mode', async () => {
    const appWithMaintenanceMode = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                maintenance: true,
                maintenanceMode: true,
            },
        },
    });

    return appWithMaintenanceMode.request
        .post('/api/admin/features')
        .send({
            name: 'maintenance-feature',
        })
        .set('Content-Type', 'application/json')
        .expect(503);
});

test('should not go into maintenance, when feature is fully turned off', async () => {
    const appWithMaintenanceMode = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                maintenance: false,
                maintenanceMode: true,
            },
        },
    });

    return appWithMaintenanceMode.request
        .post('/api/admin/features')
        .send({
            name: 'maintenance-feature1',
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('should not go into maintenance, when user has not set it', async () => {
    const appWithMaintenanceMode = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                maintenance: true,
                maintenanceMode: false,
            },
        },
    });

    return appWithMaintenanceMode.request
        .post('/api/admin/features')
        .send({
            name: 'maintenance-feature1',
        })
        .set('Content-Type', 'application/json')
        .expect(201);
});

test('should go into maintenance, when user has set it', async () => {
    const appWithMaintenanceMode = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                maintenance: true,
                maintenanceMode: false,
            },
        },
    });

    await appWithMaintenanceMode.request
        .post('/api/admin/maintenance')
        .send({
            enabled: true,
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    return appWithMaintenanceMode.request
        .post('/api/admin/features')
        .send({
            name: 'maintenance-feature1',
        })
        .set('Content-Type', 'application/json')
        .expect(503);
});

test('should 404 on maintenance endpoint, when disabled', async () => {
    const appWithMaintenanceMode = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                maintenance: false,
            },
        },
    });

    await appWithMaintenanceMode.request
        .post('/api/admin/maintenance')
        .send({
            enabled: true,
        })
        .set('Content-Type', 'application/json')
        .expect(404);
});

test('feature flag should take precedence over setting', async () => {
    const appWithMaintenanceMode = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                maintenance: true,
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
        .expect(200);

    return appWithMaintenanceMode.request
        .post('/api/admin/features')
        .send({
            name: 'maintenance-feature1',
        })
        .set('Content-Type', 'application/json')
        .expect(503);
});
