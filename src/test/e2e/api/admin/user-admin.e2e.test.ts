import postgresPkg from 'pg';
const { Client } = postgresPkg;
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import {
    USER_CREATED,
    USER_DELETED,
    USER_UPDATED,
} from '../../../../lib/events/index.js';
import type { IRole } from '../../../../lib/types/stores/access-store.js';
import type { IEventStore } from '../../../../lib/types/stores/event-store.js';
import type { IUserStore } from '../../../../lib/types/stores/user-store.js';
import { RoleName } from '../../../../lib/types/model.js';
import type { IRoleStore } from '../../../../lib/types/stores/role-store.js';
import { randomId } from '../../../../lib/util/random-id.js';
import { omitKeys } from '../../../../lib/util/omit-keys.js';
import type { ISessionStore } from '../../../../lib/types/stores/session-store.js';
import type { IUnleashStores } from '../../../../lib/types/index.js';
import { createHash, randomUUID } from 'crypto';
import { createDb } from '../../../../lib/db/db-pool.js';
import { migrateDb } from '../../../../migrator.js';
import { createTestConfig } from '../../../config/test-config.js';
import { getDbConfig } from '../../../../lib/server-impl.js';

let stores: IUnleashStores;
let db: ITestDb;
let app: IUnleashTest;

let userStore: IUserStore;
let eventStore: IEventStore;
let roleStore: IRoleStore;
let sessionStore: ISessionStore;
let editorRole: IRole;
let adminRole: IRole;

describe('Users created without an event are amended', () => {
    const testDbName = `migration_test_${randomUUID().replace(/-/g, '')}`;
    const dbConnConfig = getDbConfig();
    beforeAll(async () => {
        // create a new empty database for this test
        const client = new Client(dbConnConfig);
        await client.connect();
        await client.query(`CREATE DATABASE ${testDbName}`);
        await client.end();
    });

    test('should amend users created without an event', async () => {
        // connect to the new database
        const config = createTestConfig({
            db: {
                ...dbConnConfig,
                ssl: false,
                database: testDbName,
            },
            getLogger,
        });
        const db = createDb(config);
        // migrate up to the migration we want to test
        await migrateDb(config, '20250707153020-unknown-flags-environment.js');

        const eventsBefore = await db('events').select('*');
        const insertedUser = (
            await db('users')
                .insert({
                    created_at: new Date('2023-01-01T00:00:00Z'),
                    email: 'some@getunelash.io',
                    name: 'Some Name',
                })
                .returning('*')
        )[0];

        expect(insertedUser).toBeDefined();
        expect(insertedUser.name).toBe('Some Name');
        expect(insertedUser.created_at).toBeDefined();
        const eventsAfter = await db('events').select('*');
        expect(eventsAfter.length).toBe(eventsBefore.length);

        // apply the rest of migrations
        await migrateDb(config);
        const eventsPostMigrations = await db('events').select('*');
        expect(eventsPostMigrations.length).toBe(eventsBefore.length + 1);
        const userCreatedEvent = eventsPostMigrations.find(
            (e) => e.type === USER_CREATED && e.data.id === insertedUser.id,
        );
        expect(userCreatedEvent).toMatchObject({
            type: 'user-created',
            created_at: new Date('2023-01-01T00:00:00Z'),
            data: {
                id: insertedUser.id,
                email: 'some@getunelash.io',
                name: 'Some Name',
            },
        });
    });
});

describe('User Admin API with email configuration', () => {
    beforeAll(async () => {
        db = await dbInit('user_admin_api_serial', getLogger);
        app = await setupAppWithCustomConfig(
            db.stores,
            {
                email: {
                    host: 'smtp.ethereal.email',
                    smtpuser: 'rafaela.pouros@ethereal.email',
                    smtppass: 'CuVPBSvUFBPuqXMFEe',
                },
                experimental: {
                    flags: {
                        strictSchemaValidation: true,
                        showUserDeviceCount: true,
                    },
                },
            },
            db.rawDatabase,
        );
        const roles = await db.stores.roleStore.getRootRoles();
        editorRole = roles.find((r) => r.name === RoleName.EDITOR)!!;
    });

    afterAll(async () => {
        await app.destroy();
        await db.destroy();
    });
    test('Creates a user but does not send email if sendEmail is set to false', async () => {
        await app.request
            .post('/api/admin/user-admin')
            .send({
                email: 'some@getunelash.ai',
                name: 'Some Name',
                rootRole: editorRole.id,
                sendEmail: false,
            })
            .set('Content-Type', 'application/json')
            .expect(201)
            .expect((res) => {
                expect(res.body.emailSent).toBeFalsy();
            });

        await app.request
            .post('/api/admin/user-admin')
            .send({
                email: 'some2@getunelash.ai',
                name: 'Some2 Name',
                rootRole: editorRole.id,
            })
            .set('Content-Type', 'application/json')
            .expect(201)
            .expect((res) => {
                expect(res.body.emailSent).toBeTruthy();
            });
    });
});

describe('User Admin API without email', () => {
    beforeAll(async () => {
        db = await dbInit('user_admin_api_serial', getLogger);
        stores = db.stores;
        app = await setupAppWithCustomConfig(
            stores,
            {
                experimental: {
                    flags: {
                        strictSchemaValidation: true,
                        showUserDeviceCount: true,
                    },
                },
                rateLimiting: {
                    createUserMaxPerMinute: 100,
                },
            },
            db.rawDatabase,
        );

        userStore = stores.userStore;
        eventStore = stores.eventStore;
        roleStore = stores.roleStore;
        sessionStore = stores.sessionStore;
        const roles = await roleStore.getRootRoles();
        editorRole = roles.find((r) => r.name === RoleName.EDITOR)!!;
        adminRole = roles.find((r) => r.name === RoleName.ADMIN)!!;
    });

    afterAll(async () => {
        await app.destroy();
        await db.destroy();
    });

    afterEach(async () => {
        await userStore.deleteAll();
    });

    test('returns empty list of users', async () => {
        return app.request
            .get('/api/admin/user-admin')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => {
                expect(res.body.users.length).toBe(0);
            });
    });

    test('creates and returns all users', async () => {
        const createUserRequests = [...Array(10).keys()].map((i) =>
            app.request
                .post('/api/admin/user-admin')
                .send({
                    email: `some${i}@getunleash.ai`,
                    name: `Some Name ${i}`,
                    rootRole: editorRole.id,
                })
                .set('Content-Type', 'application/json'),
        );

        await Promise.all(createUserRequests);

        return app.request
            .get('/api/admin/user-admin')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => {
                expect(res.body.users.length).toBe(10);
                expect(res.body.users[2].rootRole).toBe(editorRole.id);
            });
    });

    test('creates editor-user without password', async () => {
        return app.request
            .post('/api/admin/user-admin')
            .send({
                email: 'some@getunelash.ai',
                name: 'Some Name',
                rootRole: editorRole.id,
            })
            .set('Content-Type', 'application/json')
            .expect(201)
            .expect((res) => {
                expect(res.body.email).toBe('some@getunelash.ai');
                expect(res.body.rootRole).toBe(editorRole.id);
                expect(res.body.id).toBeTruthy();
            });
    });

    test('When invalid role is provided the user is not created', async () => {
        const invalidRoleId = 0;
        await app.request
            .post('/api/admin/user-admin')
            .send({
                email: 'should-not-exist@getunleash.ai',
                name: 'I am the invisible man',
                rootRole: invalidRoleId,
            })
            .set('Content-Type', 'application/json')
            .expect(400);

        return app.request
            .get('/api/admin/user-admin')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => {
                expect(res.body.users).not.toContainEqual(
                    expect.objectContaining({
                        email: 'should-not-exist@getunleash.ai',
                    }),
                );
            });
    });

    test('creates admin-user with password', async () => {
        const { body } = await app.request
            .post('/api/admin/user-admin')
            .send({
                email: 'some@getunelash.ai',
                name: 'Some Name',
                password: 'some-strange-pass-123-GH',
                rootRole: adminRole.id,
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        expect(body.rootRole).toBe(adminRole.id);

        const user = await userStore.getByQuery({ id: body.id });
        expect(user.email).toBe('some@getunelash.ai');
        expect(user.name).toBe('Some Name');

        const passwordHash = userStore.getPasswordHash(body.id);
        expect(passwordHash).toBeTruthy();

        const roles = await stores.accessStore.getRolesForUserId(body.id);
        expect(roles.length).toBe(1);
        expect(roles[0].name).toBe(RoleName.ADMIN);
    });

    test('requires known root role', async () => {
        return app.request
            .post('/api/admin/user-admin')
            .send({
                email: 'some@getunelash.ai',
                name: 'Some Name',
                rootRole: 'Unknown',
            })
            .set('Content-Type', 'application/json')
            .expect(400);
    });

    test('should require username or email on create', async () => {
        await app.request
            .post('/api/admin/user-admin')
            .send({ rootRole: adminRole.id })
            .set('Content-Type', 'application/json')
            .expect(400)
            .expect((res) => {
                expect(res.body.details[0].message).toEqual(
                    'You must specify username or email',
                );
            });
    });

    test('update user name', async () => {
        const { body } = await app.request
            .post('/api/admin/user-admin')
            .send({
                email: 'some@getunelash.ai',
                name: 'Some Name',
                rootRole: editorRole.id,
            })
            .set('Content-Type', 'application/json');

        return app.request
            .put(`/api/admin/user-admin/${body.id}`)
            .send({
                name: 'New name',
            })
            .set('Content-Type', 'application/json')
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe('some@getunelash.ai');
                expect(res.body.name).toBe('New name');
                expect(res.body.id).toBe(body.id);
            });
    });

    test('should not require any fields on update', async () => {
        const { body: created } = await app.request
            .post('/api/admin/user-admin')
            .send({
                email: `${randomId()}@example.com`,
                rootRole: editorRole.id,
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        const { body: updated } = await app.request
            .put(`/api/admin/user-admin/${created.id}`)
            .send({})
            .set('Content-Type', 'application/json')
            .expect(200);

        expect(updated).toEqual(
            omitKeys(created, 'emailSent', 'inviteLink', 'rootRole'),
        );
    });

    test('get a single user', async () => {
        const { body } = await app.request
            .post('/api/admin/user-admin')
            .send({
                email: 'some2@getunelash.ai',
                name: 'Some Name 2',
                rootRole: editorRole.id,
            })
            .set('Content-Type', 'application/json');

        const { body: user } = await app.request
            .get(`/api/admin/user-admin/${body.id}`)
            .expect(200);

        expect(user.email).toBe('some2@getunelash.ai');
        expect(user.name).toBe('Some Name 2');
        expect(user.id).toBe(body.id);
    });

    test('should delete user', async () => {
        const user = await userStore.insert({ email: 'some@mail.com' });

        await app.request
            .delete(`/api/admin/user-admin/${user.id}`)
            .expect(200);
        await app.request.get(`/api/admin/user-admin/${user.id}`).expect(404);
    });

    test('validator should require strong password', async () => {
        return app.request
            .post('/api/admin/user-admin/validate-password')
            .send({ password: 'simple' })
            .expect(400);
    });

    test('validator should accept strong password', async () => {
        return app.request
            .post('/api/admin/user-admin/validate-password')
            .send({ password: 'simple123-_ASsad' })
            .expect(200);
    });

    test('should change password', async () => {
        const user = await userStore.insert({ email: 'some@mail.com' });
        await sessionStore.insertSession({
            sid: '1',
            sess: { user: { id: user.id } },
        });
        expect(await sessionStore.getSessionsForUser(user.id)).toHaveLength(1);

        await app.request
            .post(`/api/admin/user-admin/${user.id}/change-password`)
            .send({ password: 'simple123-_ASsad' })
            .expect(200);
        expect(await sessionStore.getSessionsForUser(user.id)).toHaveLength(0);
    });

    test('should search for users', async () => {
        await userStore.insert({ email: 'some@mail.com' });
        await userStore.insert({ email: 'another@mail.com' });
        await userStore.insert({ email: 'another2@mail.com' });

        return app.request
            .get('/api/admin/user-admin/search?q=another')
            .expect(200)
            .expect((res) => {
                expect(res.body.length).toBe(2);
                expect(
                    res.body.some((u) => u.email === 'another@mail.com'),
                ).toBe(true);
            });
    });

    test('Creates a user and includes inviteLink and emailConfigured', async () => {
        return app.request
            .post('/api/admin/user-admin')
            .send({
                email: 'some@getunelash.ai',
                name: 'Some Name',
                rootRole: editorRole.id,
            })
            .set('Content-Type', 'application/json')
            .expect(201)
            .expect((res) => {
                expect(res.body.email).toBe('some@getunelash.ai');
                expect(res.body.rootRole).toBe(editorRole.id);
                expect(res.body.inviteLink).toBeTruthy();
                expect(res.body.emailSent).toBeFalsy();
                expect(res.body.id).toBeTruthy();
            });
    });

    test('generates USER_CREATED event', async () => {
        const email = 'some@getunelash.ai';
        const name = 'Some Name';

        const { body } = await app.request
            .post('/api/admin/user-admin')
            .send({
                email,
                name,
                password: 'some-strange-pass-123-GH',
                rootRole: adminRole.id,
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        const events = await eventStore.getEvents();

        expect(events[0].type).toBe(USER_CREATED);
        expect(events[0].data.email).toBe(email);
        expect(events[0].data.name).toBe(name);
        expect(events[0].data.id).toBe(body.id);
        expect(events[0].data.password).toBeFalsy();
    });

    test('generates USER_DELETED event', async () => {
        const user = await userStore.insert({ email: 'some@mail.com' });
        await app.request
            .delete(`/api/admin/user-admin/${user.id}`)
            .expect(200);

        const events = await eventStore.getEvents();
        expect(events[0].type).toBe(USER_DELETED);
        expect(events[0].preData.id).toBe(user.id);
        expect(events[0].preData.email).toBe(user.email);
    });

    test('generates USER_UPDATED event', async () => {
        const { body } = await app.request
            .post('/api/admin/user-admin')
            .send({
                email: 'some@getunelash.ai',
                name: 'Some Name',
                rootRole: editorRole.id,
            })
            .set('Content-Type', 'application/json');

        await app.request
            .put(`/api/admin/user-admin/${body.id}`)
            .send({
                name: 'New name',
            })
            .set('Content-Type', 'application/json');

        const events = await eventStore.getEvents();
        expect(events[0].type).toBe(USER_UPDATED);
        expect(events[0].data.id).toBe(body.id);
        expect(events[0].data.name).toBe('New name');
    });

    test('Anonymises name, username and email fields if anonymiseEventLog flag is set', async () => {
        const anonymisedApp = await setupAppWithCustomConfig(
            stores,
            { experimental: { flags: { anonymiseEventLog: true } } },
            db.rawDatabase,
        );
        await anonymisedApp.request
            .post('/api/admin/user-admin')
            .send({
                email: 'some@getunleash.ai',
                name: 'Some Name',
                rootRole: editorRole.id,
            })
            .set('Content-Type', 'application/json');
        const response = await anonymisedApp.request.get(
            '/api/admin/user-admin/access',
        );
        const body = response.body;
        expect(body.users[0].email).toEqual('aeb83743e@unleash.run');
        expect(body.users[0].name).toEqual('3a8b17647@unleash.run');
        expect(body.users[0].username).toEqual(''); // Not set, so anonymise should return the empty string.
    });

    test('creates user with email sha256 hash', async () => {
        await app.request
            .post('/api/admin/user-admin')
            .send({
                email: `hasher@getunleash.ai`,
                name: `Some Name Hash`,
                rootRole: editorRole.id,
            })
            .set('Content-Type', 'application/json')
            .expect(201);

        const user = await db
            .rawDatabase('users')
            .where({ email: 'hasher@getunleash.ai' })
            .first(['email_hash']);

        const expectedHash = createHash('sha256')
            .update('hasher@getunleash.ai')
            .digest('hex');

        expect(user.email_hash).toBe(expectedHash);
    });

    test('should return number of sessions per user', async () => {
        const user = await userStore.insert({ email: 'tester@example.com' });
        await sessionStore.insertSession({
            sid: '1',
            sess: { user: { id: user.id } },
        });
        await sessionStore.insertSession({
            sid: '2',
            sess: { user: { id: user.id } },
        });

        const user2 = await userStore.insert({ email: 'tester2@example.com' });
        await sessionStore.insertSession({
            sid: '3',
            sess: { user: { id: user2.id } },
        });

        const response = await app.request
            .get(`/api/admin/user-admin`)
            .expect(200);

        expect(response.body).toMatchObject({
            users: expect.arrayContaining([
                expect.objectContaining({
                    email: 'tester@example.com',
                    activeSessions: 2,
                }),
                expect.objectContaining({
                    email: 'tester2@example.com',
                    activeSessions: 1,
                }),
            ]),
        });
    });

    test('should only delete scim users', async () => {
        userStore.insert({
            email: 'boring@example.com',
        });

        await userStore.insert({
            email: 'really-boring@example.com',
        });

        const _scimUser = (
            await db
                .rawDatabase('users')
                .insert({
                    email: 'made-by-scim@example.com',
                    scim_id: 'some-random-scim-id',
                })
                .returning('id')
        )[0].id;

        await app.request
            .delete('/api/admin/user-admin/scim-users')
            .expect(200);
        const response = await app.request
            .get(`/api/admin/user-admin`)
            .expect(200);
        const users = response.body.users;

        expect(users.length).toBe(2);
        expect(users.every((u) => u.email !== 'made-by-scim@example.com')).toBe(
            true,
        );
    });
});
