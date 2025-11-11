import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { ApiTokenType } from '../../../../lib/types/model.js';
import { RoleName } from '../../../../lib/types/model.js';
import {
    CREATE_CLIENT_API_TOKEN,
    CREATE_PROJECT_API_TOKEN,
    DELETE_CLIENT_API_TOKEN,
    type IApiToken,
    type IUnleashStores,
    READ_CLIENT_API_TOKEN,
    READ_FRONTEND_API_TOKEN,
    SYSTEM_USER_AUDIT,
    SYSTEM_USER_ID,
    UPDATE_CLIENT_API_TOKEN,
} from '../../../../lib/types/index.js';
import { addDays } from 'date-fns';
import type { PermissionRef } from '../../../../lib/services/access-service.js';

let stores: IUnleashStores;
let db: ITestDb;
let app: IUnleashTest;
let adminToken: IApiToken;
let frontendToken: IApiToken;
let clientToken: IApiToken;
let backendToken: IApiToken;

const setupUser = async (
    email: string,
    roleName: RoleName,
    permissions?: PermissionRef[],
) => {
    const { accessService, userService } = app.services;
    const role = (await accessService.getPredefinedRole(roleName))!;
    const user = await userService.createUser(
        {
            email,
            rootRole: role.id,
        },
        SYSTEM_USER_AUDIT,
    );
    if (permissions) {
        const createClientApiTokenRole = await accessService.createRole(
            {
                name: `project_client_${email}`,
                description: `${email} role`,
                permissions,
                type: 'root-custom',
                createdByUserId: SYSTEM_USER_ID,
            },
            SYSTEM_USER_AUDIT,
        );
        await accessService.addUserToRole(
            user.id,
            createClientApiTokenRole.id,
            'default',
        );
    }
};

beforeAll(async () => {
    db = await dbInit('token_api_auth_serial', getLogger);
    stores = db.stores;
    app = await setupAppWithAuth(stores, {}, db.rawDatabase);

    // insert initial tokens
    clientToken = await stores.apiTokenStore.insert({
        environment: '',
        projects: [],

        tokenName: 'client',
        secret: '*:environment.client_secret',
        type: ApiTokenType.CLIENT,
    });
    backendToken = await stores.apiTokenStore.insert({
        environment: '',
        projects: [],

        tokenName: 'backend',
        secret: '*:environment.backend_secret',
        type: ApiTokenType.BACKEND,
    });
    adminToken = await stores.apiTokenStore.insert({
        environment: '',
        projects: [],
        tokenName: 'admin',
        secret: '*:*.sdfsdf2admin_secret',
        type: ApiTokenType.ADMIN,
    });
    frontendToken = await stores.apiTokenStore.insert({
        environment: '',
        projects: [],
        tokenName: 'frontender',
        secret: '*:environment:sdfsdf2dfrontend_Secret',
        type: ApiTokenType.FRONTEND,
    });
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

test('editor users should only get client, backend or frontend tokens', async () => {
    await setupUser('editor@example.com', RoleName.EDITOR, [
        { name: READ_CLIENT_API_TOKEN },
        { name: READ_FRONTEND_API_TOKEN },
    ]);
    await app.login({ email: 'editor@example.com' });

    await app.request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tokens.length).toBe(3);
            expect(res.body.tokens[0].type).toBe(ApiTokenType.CLIENT);
            expect(res.body.tokens[1].type).toBe(ApiTokenType.FRONTEND);
            expect(res.body.tokens[2].type).toBe(ApiTokenType.CLIENT);
        });
});

test('viewer users should not be allowed to fetch tokens', async () => {
    await setupUser('viewer@example.com', RoleName.VIEWER);
    await app.login({ email: 'viewer@example.com' });
    await app.request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(403);
});

test.each(['client', 'backend'])(
    'A role with only CREATE_PROJECT_API_TOKEN can create project %s token',
    async (type) => {
        const email = `powerpuff-${type}@example.com`;
        await setupUser(email, RoleName.VIEWER, [
            { name: CREATE_PROJECT_API_TOKEN, environment: 'default' },
        ]);

        await app.login({ email });
        const { body, status } = await app.request
            .post('/api/admin/projects/default/api-tokens')
            .send({
                tokenName: `${type}-token-maker`,
                type,
                environment: 'development',
                projects: ['default'],
            })
            .set('Content-Type', 'application/json');

        expect(status).toBe(201);
        // clean up
        await stores.apiTokenStore.delete(body.secret);
    },
);

describe('Fine grained API token permissions', () => {
    describe('A role with access to CREATE_CLIENT_API_TOKEN', () => {
        test('should be allowed to create client tokens', async () => {
            await setupUser(
                'mylittlepony_viewer@example.com',
                RoleName.VIEWER,
                [{ name: CREATE_CLIENT_API_TOKEN }],
            );
            await app.login({ email: 'mylittlepony_viewer@example.com' });
            const { body } = await app.request
                .post('/api/admin/api-tokens')
                .send({
                    tokenName: 'default-client',
                    type: 'client',
                })
                .set('Content-Type', 'application/json')
                .expect(201);

            // clean up
            await stores.apiTokenStore.delete(body.secret);
        });
        test('should NOT be allowed to create frontend tokens', async () => {
            await setupUser(
                'mylittlepony_viewer_frontend@example.com',
                RoleName.VIEWER,
                [{ name: CREATE_CLIENT_API_TOKEN }],
            );
            await app.login({
                email: 'mylittlepony_viewer_frontend@example.com',
            });
            await app.request
                .post('/api/admin/api-tokens')
                .send({
                    tokenName: 'default-frontend',
                    type: 'frontend',
                })
                .set('Content-Type', 'application/json')
                .expect(403);
        });
    });
    describe('Read operations', () => {
        test('READ_FRONTEND_API_TOKEN should be able to see FRONTEND tokens', async () => {
            await setupUser(
                'read_frontend_token@example.com',
                RoleName.VIEWER,
                [{ name: READ_FRONTEND_API_TOKEN }],
            );
            await app.login({ email: 'read_frontend_token@example.com' });

            const { body, status } = await app.request
                .get('/api/admin/api-tokens')
                .set('Content-Type', 'application/json');
            expect(status).toBe(200);
            expect(
                body.tokens.every((t) => t.type === ApiTokenType.FRONTEND),
            ).toBe(true);
        });
        test('READ_CLIENT_API_TOKEN should be able to see CLIENT and BACKEND tokens', async () => {
            await setupUser('read_client_token@example.com', RoleName.VIEWER, [
                { name: READ_CLIENT_API_TOKEN },
            ]);
            await app.login({ email: 'read_client_token@example.com' });

            await app.request
                .get('/api/admin/api-tokens')
                .set('Content-Type', 'application/json')
                .expect(200)
                .expect((res) => {
                    expect(res.body.tokens).toHaveLength(2);
                    expect(res.body.tokens[0].type).toBe(ApiTokenType.CLIENT);
                    expect(res.body.tokens[1].type).toBe(ApiTokenType.CLIENT);
                });
        });
        test('Admin users should be able to see all tokens', async () => {
            await setupUser('read_admin_token@example.com', RoleName.ADMIN);
            await app.login({ email: 'read_admin_token@example.com' });
            const { body, status } = await app.request
                .get('/api/admin/api-tokens')
                .set('Content-Type', 'application/json');
            expect(status).toBe(200);
            expect(body.tokens).toHaveLength(4);
            [
                { tokenType: ApiTokenType.ADMIN, expectedCount: 1 },
                { tokenType: ApiTokenType.CLIENT, expectedCount: 2 },
                { tokenType: ApiTokenType.FRONTEND, expectedCount: 1 },
            ].forEach(({ tokenType, expectedCount }) => {
                expect(
                    body.tokens.filter(
                        (t: { type: string }) => t.type === tokenType,
                    ),
                ).toHaveLength(expectedCount);
            });
        });
        test('Editor users should be able to see all tokens except ADMIN tokens', async () => {
            await setupUser(
                'standard-editor-reads-tokens@example.com',
                RoleName.EDITOR,
            );
            await app.login({
                email: 'standard-editor-reads-tokens@example.com',
            });
            await app.request
                .get('/api/admin/api-tokens')
                .set('Content-Type', 'application/json')
                .expect(200)
                .expect((res) => {
                    expect(res.body.tokens).toHaveLength(3);
                    expect(
                        res.body.tokens.filter(
                            ({ type }) => type === ApiTokenType.ADMIN,
                        ),
                    ).toHaveLength(0);
                });
        });
    });
    describe('Update operations', () => {
        describe('UPDATE_CLIENT_API_TOKEN can', () => {
            test('UPDATE client_api token expiry', async () => {
                await setupUser(
                    'update_client_token@example.com',
                    RoleName.VIEWER,
                    [{ name: UPDATE_CLIENT_API_TOKEN }],
                );
                await app.login({ email: 'update_client_token@example.com' });
                await app.request
                    .put(`/api/admin/api-tokens/${clientToken.secret}`)
                    .send({ expiresAt: addDays(new Date(), 14) })
                    .expect(200);
            });
            test('NOT UPDATE frontend_api token expiry', async () => {
                await setupUser(
                    'update_frontend_token@example.com',
                    RoleName.VIEWER,
                    [{ name: UPDATE_CLIENT_API_TOKEN }],
                );
                await app.login({ email: 'update_frontend_token@example.com' });
                await app.request
                    .put(`/api/admin/api-tokens/${frontendToken.secret}`)
                    .send({ expiresAt: addDays(new Date(), 14) })
                    .expect(403);
            });
            test('NOT UPDATE admin_api token expiry', async () => {
                await setupUser(
                    'update_admin_token@example.com',
                    RoleName.VIEWER,
                    [{ name: UPDATE_CLIENT_API_TOKEN }],
                );
                await app.request
                    .put(`/api/admin/api-tokens/${adminToken.secret}`)
                    .send({ expiresAt: addDays(new Date(), 14) })
                    .expect(403);
            });
        });
    });
    describe('Delete operations', () => {
        describe('DELETE_CLIENT_API_TOKEN can', () => {
            test('DELETE client_api token', async () => {
                await setupUser(
                    'delete_client_token@example.com',
                    RoleName.VIEWER,
                    [{ name: DELETE_CLIENT_API_TOKEN }],
                );
                await app.login({ email: 'delete_client_token@example.com' });
                const tokenToDelete = await stores.apiTokenStore.insert({
                    environment: '',
                    projects: [],
                    tokenName: 'cilent',
                    secret: '*:environment.delete_client_token',
                    type: ApiTokenType.CLIENT,
                });
                await app.request
                    .delete(`/api/admin/api-tokens/${tokenToDelete.secret}`)
                    .send({ expiresAt: addDays(new Date(), 14) })
                    .expect(200);
            });
            test('NOT DELETE frontend_api token', async () => {
                await setupUser(
                    'delete_frontend_token@example.com',
                    RoleName.VIEWER,
                    [{ name: DELETE_CLIENT_API_TOKEN }],
                );
                await app.login({ email: 'delete_frontend_token@example.com' });
                await app.request
                    .delete(`/api/admin/api-tokens/${frontendToken.secret}`)
                    .send({ expiresAt: addDays(new Date(), 14) })
                    .expect(403);
            });
            test('NOT DELETE admin_api token', async () => {
                await setupUser(
                    'delete_admin_token@example.com',
                    RoleName.VIEWER,
                    [{ name: DELETE_CLIENT_API_TOKEN }],
                );
                await app.login({ email: 'delete_admin_token@example.com' });

                await app.request
                    .delete(`/api/admin/api-tokens/${adminToken.secret}`)
                    .send({ expiresAt: addDays(new Date(), 14) })
                    .expect(403);
            });
        });
    });
});
