import { setupAppWithCustomAuth } from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { RoleName } from '../../../../lib/types/model.js';
import type { PublicSignupTokenCreateSchema } from '../../../../lib/openapi/spec/public-signup-token-create-schema.js';
import type { IUnleashStores } from '../../../../lib/types/index.js';

let stores: IUnleashStores;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('public_signup_test', getLogger);
    stores = db.stores;
});

afterEach(async () => {
    await stores.publicSignupTokenStore.deleteAll();
    await stores.eventStore.deleteAll();
    await stores.userStore.deleteAll();
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

const expireAt = (addDays: number = 7): Date => {
    const now = new Date();
    now.setDate(now.getDate() + addDays);
    return now;
};

test('admin users should be able to create a token', async () => {
    expect.assertions(3);

    const preHook = (app, _config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, _res, next) => {
            const role = await accessService.getPredefinedRole(RoleName.ADMIN);
            const user = await userService.createUser({
                email: 'admin@example.com',
                rootRole: role.id,
            });
            req.user = user;
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(stores, preHook);

    const tokenCreate: PublicSignupTokenCreateSchema = {
        name: 'some-name',
        expiresAt: expireAt().toISOString(),
    };

    await request
        .post('/api/admin/invite-link/tokens')
        .send(tokenCreate)
        .expect('Content-Type', /json/)
        .expect(201)
        .expect((res) => {
            expect(res.body.name).toBe('some-name');
            expect(res.body.secret).not.toBeNull();
            expect(res.body.url).not.toBeNull();
        });

    await destroy();
});

test('no permission to validate a token', async () => {
    const preHook = (app, _config, { userService, accessService }) => {
        app.use('/api/admin/', async (_req, _res, next) => {
            const admin = await accessService.getPredefinedRole(RoleName.ADMIN);
            await userService.createUser({
                email: 'admin@example.com',
                username: 'admin@example.com',
                rootRole: admin.id,
            });
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(stores, preHook);

    await stores.publicSignupTokenStore.insert({
        url: 'http://localhost:4242/invite/some-secret/signup',
        name: 'some-name',
        expiresAt: expireAt(),
        secret: 'some-secret',
        createdBy: 'admin@example.com',
        roleId: 3,
    });
    await request.get('/invite/some-secret/validate').expect(200);

    await destroy();
});

test('should return 400 if token can not be validate', async () => {
    const preHook = (app, _config, { userService, accessService }) => {
        app.use('/api/admin/', async (_req, _res, next) => {
            const admin = await accessService.getPredefinedRole(RoleName.ADMIN);
            await userService.createUser({
                email: 'admin@example.com',
                username: 'admin@example.com',
                rootRole: admin.id,
            });
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(stores, preHook);

    await request.get('/invite/some-invalid-secret/validate').expect(400);

    await destroy();
});

test('users can signup with invite-link', async () => {
    expect.assertions(1);

    const preHook = (app, _config, { userService, accessService }) => {
        app.use('/api/admin/', async (_req, _res, next) => {
            const admin = await accessService.getPredefinedRole(RoleName.ADMIN);
            await userService.createUser({
                email: 'admin@example.com',
                username: 'admin@example.com',
                rootRole: admin.id,
            });
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(stores, preHook);

    await stores.publicSignupTokenStore.insert({
        name: 'some-name',
        expiresAt: expireAt(),
        secret: 'some-secret',
        url: 'http://localhost:4242/invite/some-secret/signup',
        createdBy: 'admin@example.com',
        roleId: 3,
    });

    const createUser = {
        name: 'some-username',
        email: 'some@example.com',
        password: 'eweggwEG',
    };

    await request
        .post('/invite/some-secret/signup')
        .send(createUser)
        .expect(201)
        .expect((res) => {
            const user = res.body;
            expect(user.name).toBe('some-username');
        });

    await destroy();
});

test('can get a token with users', async () => {
    expect.assertions(1);

    const preHook = (app, _config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, _res, next) => {
            const role = await accessService.getPredefinedRole(RoleName.ADMIN);
            const user = await userService.createUser({
                email: 'admin@example.com',
                rootRole: role.id,
            });
            req.user = user;
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(stores, preHook);

    await stores.publicSignupTokenStore.insert({
        url: 'http://localhost:4242/invite/some-secret',
        name: 'some-name',
        expiresAt: expireAt(),
        secret: 'some-secret',
        createdBy: 'admin@example.com',
        roleId: 3,
    });

    const user = await stores.userStore.insert({
        username: 'some-username',
        email: 'some@example.com',
    });

    await stores.publicSignupTokenStore.addTokenUser('some-secret', user.id);

    await request
        .get('/api/admin/invite-link/tokens/some-secret')
        .expect(200)
        .expect((res) => {
            const token = res.body;
            expect(token.users.length).toEqual(1);
        });

    await destroy();
});

test('should not be able to set expiry further than 1 month', async () => {
    const preHook = (app, _config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, _res, next) => {
            const role = await accessService.getPredefinedRole(RoleName.ADMIN);
            const user = await userService.createUser({
                email: 'admin@example.com',
                rootRole: role.id,
            });
            req.user = user;
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(stores, preHook);

    const tokenCreate: PublicSignupTokenCreateSchema = {
        name: 'some-name',
        expiresAt: expireAt(100).toISOString(),
    };

    await request
        .post('/api/admin/invite-link/tokens')
        .send(tokenCreate)
        .expect('Content-Type', /json/)
        .expect(201)
        .expect((res) => {
            expect(new Date(res.body.expiresAt).getTime()).toBeLessThan(
                expireAt(31).getTime(),
            );
        });

    await destroy();
});
