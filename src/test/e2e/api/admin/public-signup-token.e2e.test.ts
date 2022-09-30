import { setupAppWithCustomAuth } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { RoleName } from '../../../../lib/types/model';
import { PublicSignupTokenCreateSchema } from '../../../../lib/openapi/spec/public-signup-token-create-schema';

let stores;
let db;

jest.mock('../../../../lib/util/flag-resolver', () => {
    return jest.fn().mockImplementation(() => {
        return {
            getAll: jest.fn(),
            isEnabled: jest.fn().mockResolvedValue(true),
        };
    });
});

beforeEach(async () => {
    db = await dbInit('test', getLogger);
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
    let now = new Date();
    now.setDate(now.getDate() + addDays);
    return now;
};

test('admin users should be able to create a token', async () => {
    expect.assertions(3);

    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const role = await accessService.getRootRole(RoleName.ADMIN);
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
    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const admin = await accessService.getRootRole(RoleName.ADMIN);
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
        createAt: new Date(),
        createdBy: 'admin@example.com',
        roleId: 3,
    });
    await request.get('/invite/some-secret/validate').expect(200);

    await destroy();
});

test('should return 400 if token can not be validate', async () => {
    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const admin = await accessService.getRootRole(RoleName.ADMIN);
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

    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const admin = await accessService.getRootRole(RoleName.ADMIN);
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
        createAt: new Date(),
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

    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const role = await accessService.getRootRole(RoleName.ADMIN);
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
        name: 'some-name',
        expiresAt: expireAt(),
        secret: 'some-secret',
        createAt: new Date(),
        createdBy: 'admin@example.com',
        roleId: 3,
    });

    const user = await stores.userStore.insert({
        username: 'some-username',
        email: 'some@example.com',
        password: 'eweggwEG',
        sendEmail: false,
        rootRole: 3,
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
