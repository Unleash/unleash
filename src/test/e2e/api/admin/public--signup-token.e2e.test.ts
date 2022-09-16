import { setupAppWithCustomAuth } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { RoleName } from '../../../../lib/types/model';
import { PublicSignupTokenCreateSchema } from '../../../../lib/openapi/spec/public-signup-token-create-schema';
import { CreateUserSchema } from '../../../../lib/openapi/spec/create-user-schema';

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

beforeAll(async () => {
    db = await dbInit('test', getLogger);
    stores = db.stores;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
afterEach(async () => {
    await stores.publicSignupTokenStore.deleteAll();
});

const expireAt = (addDays: number = 7): Date => {
    let now = new Date();
    now.setDate(now.getDate() + addDays);
    return now;
};

test('admin users should be able to create a token', async () => {
    expect.assertions(2);

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
        });

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
        createAt: new Date(),
        createdBy: 'admin@example.com',
        roleId: 3,
    });

    const createUser: CreateUserSchema = {
        username: 'some-username',
        email: 'some@example.com',
        password: 'eweggwEG',
        sendEmail: false,
        rootRole: 1,
    };

    await request
        .post('/api/admin/invite-link/tokens/some-secret/signup')
        .send(createUser)
        .expect(201)
        .expect((res) => {
            const user = res.body;
            expect(user.username).toBe('some-username');
        });

    await destroy();
});
