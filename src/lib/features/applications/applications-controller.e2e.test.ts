import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    createUserWithRootRole,
    type IUnleashTest,
    setupAppWithAuth,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { ApiTokenType } from '../../types/model.js';
import { RoleName } from '../../types/index.js';
import { DEFAULT_ENV } from '../../util/constants.js';

let db: ITestDb;
let app: IUnleashTest;

const applicationOverviewEnabled = {
    experimental: {
        flags: { applicationOverview: true, strictSchemaValidation: true },
    },
};

const createApplication = (request: object) =>
    app.request.post('/api/admin/applications').send(request);

const getApplicationRow = (appName: string) =>
    db
        .rawDatabase('client_applications')
        .where({ app_name: appName })
        .first('seen_at', 'announced', 'created_by', 'description');

const getCreatedEvents = (appName: string) =>
    db
        .rawDatabase('events')
        .where({ type: 'application-created' })
        .whereRaw("data->>'appName' = ?", [appName])
        .select('data');

beforeAll(async () => {
    db = await dbInit('applications_controller', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        applicationOverviewEnabled,
        db.rawDatabase,
    );
});

afterEach(async () => {
    await db.rawDatabase('client_applications').del();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('creates an application that no SDK has reported, set up and visible at once', async () => {
    const { body, headers } = await createApplication({
        appName: 'checkout-service',
        description: 'Payment and basket service',
    }).expect(201);

    expect(body).toMatchObject({
        appName: 'checkout-service',
        description: 'Payment and basket service',
        createdAt: expect.any(String),
    });
    const row = await getApplicationRow('checkout-service');
    // Never seen: the 30-day cleanup only removes Applications an SDK
    // reported and then stopped reporting.
    expect(row.seen_at).toBeNull();
    await app.request.get(`/api/admin/${headers.location}`).expect(200);
    expect(await getCreatedEvents('checkout-service')).toHaveLength(1);
});

test('refuses a name that already exists, and names it', async () => {
    await db.stores.clientApplicationsStore.upsert({
        appName: 'taken-service',
    });

    const { body } = await createApplication({
        appName: 'taken-service',
    }).expect(409);

    expect(body.message).toContain('"taken-service"');
});

test('rejects a name with a space, because names are never trimmed', async () => {
    await createApplication({ appName: 'checkout service' }).expect(400);
});

test('a later SDK registration reuses the created application, keeps what the person entered and announces nothing new', async () => {
    await createApplication({
        appName: 'deployed-service',
        description: 'Ships orders',
    }).expect(201);
    const created = await getApplicationRow('deployed-service');

    await app.services.clientInstanceService.registerBackendClient(
        {
            appName: 'deployed-service',
            instanceId: 'deployed-instance',
            strategies: ['default'],
            started: new Date(),
            interval: 10,
        },
        '127.0.0.1',
        DEFAULT_ENV,
    );
    await app.services.clientInstanceService.bulkAdd();
    await app.services.clientInstanceService.announceUnannounced();

    expect(await getApplicationRow('deployed-service')).toMatchObject({
        description: 'Ships orders',
        created_by: created.created_by,
    });
});

test('returns 404 while applicationOverview is off', async () => {
    const disabledApp = await setupAppWithCustomConfig(
        db.stores,
        {},
        db.rawDatabase,
    );
    try {
        await disabledApp.request
            .post('/api/admin/applications')
            .send({ appName: 'hidden-service' })
            .expect(404);
        expect(await getApplicationRow('hidden-service')).toBeUndefined();
    } finally {
        await disabledApp.destroy();
    }
});

test('needs UPDATE_APPLICATION, and records who created it, including an admin API token', async () => {
    const authApp = await setupAppWithAuth(
        db.stores,
        applicationOverviewEnabled,
        db.rawDatabase,
    );
    try {
        // Before any login: a session cookie would take precedence over the token.
        const adminToken =
            await authApp.services.apiTokenService.createApiTokenWithProjects({
                tokenName: 'application-creator',
                type: ApiTokenType.ADMIN,
                projects: ['*'],
                environment: '*',
            });
        await authApp.request
            .post('/api/admin/applications')
            .set('Authorization', adminToken.secret)
            .send({ appName: 'automated-service' })
            .expect(201);
        expect(await getApplicationRow('automated-service')).toMatchObject({
            created_by: 'application-creator',
        });

        await createUserWithRootRole({
            app: authApp,
            stores: db.stores,
            email: 'application-viewer@example.com',
            roleName: RoleName.VIEWER,
        });
        await authApp.login({ email: 'application-viewer@example.com' });
        await authApp.request
            .post('/api/admin/applications')
            .send({ appName: 'viewer-service' })
            .expect(403);

        await createUserWithRootRole({
            app: authApp,
            stores: db.stores,
            email: 'application-admin@example.com',
            roleName: RoleName.ADMIN,
        });
        await authApp.login({ email: 'application-admin@example.com' });
        await authApp.request
            .post('/api/admin/applications')
            .send({ appName: 'admin-service' })
            .expect(201);
        expect(await getApplicationRow('admin-service')).toMatchObject({
            created_by: 'application-admin@example.com',
        });
    } finally {
        await authApp.destroy();
    }
});
