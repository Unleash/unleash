import { setupAppWithCustomAuth } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { ApiTokenType } from '../../../../lib/types/models/api-token';
import { RoleName } from '../../../../lib/types/model';
import {
    CREATE_API_TOKEN,
    CREATE_CLIENT_API_TOKEN,
    READ_ADMIN_API_TOKEN,
    READ_API_TOKEN,
    READ_CLIENT_API_TOKEN,
    READ_FRONTEND_API_TOKEN,
    UPDATE_API_TOKEN,
    UPDATE_CLIENT_API_TOKEN,
} from '../../../../lib/types';
import { addDays } from 'date-fns';

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('token_api_auth_serial', getLogger);
    stores = db.stores;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

afterEach(async () => {
    await stores.apiTokenStore.deleteAll();
});

test('editor users should only get client or frontend tokens', async () => {
    expect.assertions(3);

    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const role = await accessService.getRootRole(RoleName.EDITOR);
            const user = await userService.createUser({
                email: 'editor@example.com',
                rootRole: role.id,
            });
            req.user = user;
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(stores, preHook);

    await stores.apiTokenStore.insert({
        username: 'test',
        secret: '1234',
        type: ApiTokenType.CLIENT,
    });

    await stores.apiTokenStore.insert({
        username: 'frontend',
        secret: '12345',
        type: ApiTokenType.FRONTEND,
    });

    await stores.apiTokenStore.insert({
        username: 'test',
        secret: 'sdfsdf2d',
        type: ApiTokenType.ADMIN,
    });

    await request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tokens.length).toBe(2);
            expect(res.body.tokens[0].type).toBe(ApiTokenType.CLIENT);
            expect(res.body.tokens[1].type).toBe(ApiTokenType.FRONTEND);
        });

    await destroy();
});

test('viewer users should not be allowed to fetch tokens', async () => {
    expect.assertions(0);

    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const role = await accessService.getRootRole(RoleName.VIEWER);
            const user = await userService.createUser({
                email: 'viewer@example.com',
                rootRole: role.id,
            });
            req.user = user;
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(stores, preHook);

    await stores.apiTokenStore.insert({
        username: 'test',
        secret: '1234',
        type: ApiTokenType.CLIENT,
    });

    await stores.apiTokenStore.insert({
        username: 'test',
        secret: 'sdfsdf2d',
        type: ApiTokenType.ADMIN,
    });

    await request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(403);

    await destroy();
});

test('Only token-admins should be allowed to create token', async () => {
    expect.assertions(0);

    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const role = await accessService.getRootRole(RoleName.EDITOR);
            req.user = await userService.createUser({
                email: 'editor2@example.com',
                rootRole: role.id,
            });
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(stores, preHook);

    await request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-admin',
            type: 'admin',
        })
        .set('Content-Type', 'application/json')
        .expect(403);

    await destroy();
});

test('Token-admin should be allowed to create token', async () => {
    expect.assertions(0);

    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const role = await accessService.getRootRole(RoleName.ADMIN);
            req.user = await userService.createUser({
                email: 'admin@example.com',
                rootRole: role.id,
            });
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(stores, preHook);

    await request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-admin',
            type: 'admin',
        })
        .set('Content-Type', 'application/json')
        .expect(201);

    await destroy();
});

describe('Fine grained API token permissions', () => {
    describe('A role with access to CREATE_CLIENT_API_TOKEN', () => {
        test('should be allowed to create client tokens', async () => {
            const preHook = (app, config, { userService, accessService }) => {
                app.use('/api/admin/', async (req, res, next) => {
                    const role = await accessService.getRootRole(
                        RoleName.VIEWER,
                    );
                    const user = await userService.createUser({
                        email: 'mylittlepony_viewer@example.com',
                        rootRole: role.id,
                    });
                    req.user = user;
                    const createClientApiTokenRole =
                        await accessService.createRole({
                            name: 'client_token_creator',
                            description: 'Can create client tokens',
                            permissions: [],
                            type: 'root-custom',
                        });
                    await accessService.addPermissionToRole(
                        role.id,
                        CREATE_API_TOKEN,
                    );
                    await accessService.addPermissionToRole(
                        role.id,
                        CREATE_CLIENT_API_TOKEN,
                    );
                    await accessService.addUserToRole(
                        user.id,
                        createClientApiTokenRole.id,
                        'default',
                    );
                    next();
                });
            };
            const { request, destroy } = await setupAppWithCustomAuth(
                stores,
                preHook,
                {
                    experimental: {
                        flags: {
                            customRootRoles: true,
                        },
                    },
                },
            );
            await request
                .post('/api/admin/api-tokens')
                .send({
                    username: 'default-client',
                    type: 'client',
                })
                .set('Content-Type', 'application/json')
                .expect(201);
            await destroy();
        });
        test('should NOT be allowed to create frontend tokens', async () => {
            const preHook = (app, config, { userService, accessService }) => {
                app.use('/api/admin/', async (req, res, next) => {
                    const role = await accessService.getRootRole(
                        RoleName.VIEWER,
                    );
                    const user = await userService.createUser({
                        email: 'mylittlepony_viewer_frontend@example.com',
                        rootRole: role.id,
                    });
                    req.user = user;
                    const createClientApiTokenRole =
                        await accessService.createRole({
                            name: 'client_token_creator_cannot_create_frontend',
                            description: 'Can create client tokens',
                            permissions: [],
                            type: 'root-custom',
                        });
                    await accessService.addPermissionToRole(
                        role.id,
                        CREATE_API_TOKEN,
                    );
                    await accessService.addPermissionToRole(
                        role.id,
                        CREATE_CLIENT_API_TOKEN,
                    );
                    await accessService.addUserToRole(
                        user.id,
                        createClientApiTokenRole.id,
                        'default',
                    );
                    next();
                });
            };
            const { request, destroy } = await setupAppWithCustomAuth(
                stores,
                preHook,
                {
                    experimental: {
                        flags: {
                            customRootRoles: true,
                        },
                    },
                },
            );
            await request
                .post('/api/admin/api-tokens')
                .send({
                    username: 'default-frontend',
                    type: 'frontend',
                })
                .set('Content-Type', 'application/json')
                .expect(403);
            await destroy();
        });
        test('should NOT be allowed to create ADMIN tokens', async () => {
            const preHook = (app, config, { userService, accessService }) => {
                app.use('/api/admin/', async (req, res, next) => {
                    const role = await accessService.getRootRole(
                        RoleName.VIEWER,
                    );
                    const user = await userService.createUser({
                        email: 'mylittlepony_admin@example.com',
                        rootRole: role.id,
                    });
                    req.user = user;
                    const createClientApiTokenRole =
                        await accessService.createRole({
                            name: 'client_token_creator_cannot_create_admin',
                            description: 'Can create client tokens',
                            permissions: [],
                            type: 'root-custom',
                        });
                    await accessService.addPermissionToRole(
                        role.id,
                        CREATE_API_TOKEN,
                    );
                    await accessService.addPermissionToRole(
                        role.id,
                        CREATE_CLIENT_API_TOKEN,
                    );
                    await accessService.addUserToRole(
                        user.id,
                        createClientApiTokenRole.id,
                        'default',
                    );
                    next();
                });
            };
            const { request, destroy } = await setupAppWithCustomAuth(
                stores,
                preHook,
                {
                    experimental: {
                        flags: {
                            customRootRoles: true,
                        },
                    },
                },
            );
            await request
                .post('/api/admin/api-tokens')
                .send({
                    username: 'default-admin',
                    type: 'admin',
                })
                .set('Content-Type', 'application/json')
                .expect(403);
            await destroy();
        });
    });
    describe('Read operations', () => {
        test('READ_FRONTEND_API_TOKEN should be able to see FRONTEND tokens', async () => {
            const preHook = (app, config, { userService, accessService }) => {
                app.use('/api/admin/', async (req, res, next) => {
                    const role = await accessService.getRootRole(
                        RoleName.VIEWER,
                    );
                    const user = await userService.createUser({
                        email: 'read_frontend_token@example.com',
                        rootRole: role.id,
                    });
                    req.user = user;
                    const readFrontendApiToken = await accessService.createRole(
                        {
                            name: 'frontend_token_reader',
                            description: 'Can read frontend tokens',
                            permissions: [],
                            type: 'root-custom',
                        },
                    );
                    await accessService.addPermissionToRole(
                        readFrontendApiToken.id,
                        READ_API_TOKEN,
                    );
                    await accessService.addPermissionToRole(
                        readFrontendApiToken.id,
                        READ_FRONTEND_API_TOKEN,
                    );
                    await accessService.addUserToRole(
                        user.id,
                        readFrontendApiToken.id,
                        'default',
                    );
                    next();
                });
            };
            const { request, destroy } = await setupAppWithCustomAuth(
                stores,
                preHook,
                {
                    experimental: {
                        flags: {
                            customRootRoles: true,
                        },
                    },
                },
            );
            await stores.apiTokenStore.insert({
                username: 'client',
                secret: 'client_secret',
                type: ApiTokenType.CLIENT,
            });

            await stores.apiTokenStore.insert({
                username: 'admin',
                secret: 'sdfsdf2admin_secret',
                type: ApiTokenType.ADMIN,
            });
            await stores.apiTokenStore.insert({
                username: 'frontender',
                secret: 'sdfsdf2dfrontend_Secret',
                type: ApiTokenType.FRONTEND,
            });
            await request
                .get('/api/admin/api-tokens')
                .set('Content-Type', 'application/json')
                .expect(200)
                .expect((res) => {
                    expect(
                        res.body.tokens.every(
                            (t) => t.type === ApiTokenType.FRONTEND,
                        ),
                    ).toBe(true);
                });
            await destroy();
        });
        test('READ_CLIENT_API_TOKEN should be able to see CLIENT tokens', async () => {
            const preHook = (app, config, { userService, accessService }) => {
                app.use('/api/admin/', async (req, res, next) => {
                    const role = await accessService.getRootRole(
                        RoleName.VIEWER,
                    );
                    const user = await userService.createUser({
                        email: 'read_client_token@example.com',
                        rootRole: role.id,
                    });
                    req.user = user;
                    const readClientTokenRole = await accessService.createRole({
                        name: 'client_token_reader',
                        description: 'Can read client tokens',
                        permissions: [],
                        type: 'root-custom',
                    });
                    await accessService.addPermissionToRole(
                        readClientTokenRole.id,
                        READ_API_TOKEN,
                    );
                    await accessService.addPermissionToRole(
                        readClientTokenRole.id,
                        READ_CLIENT_API_TOKEN,
                    );
                    await accessService.addUserToRole(
                        user.id,
                        readClientTokenRole.id,
                        'default',
                    );
                    next();
                });
            };
            const { request, destroy } = await setupAppWithCustomAuth(
                stores,
                preHook,
                {
                    experimental: {
                        flags: {
                            customRootRoles: true,
                        },
                    },
                },
            );
            await stores.apiTokenStore.insert({
                username: 'client',
                secret: 'client_secret_1234',
                type: ApiTokenType.CLIENT,
            });

            await stores.apiTokenStore.insert({
                username: 'admin',
                secret: 'admin_secret_1234',
                type: ApiTokenType.ADMIN,
            });
            await stores.apiTokenStore.insert({
                username: 'frontender',
                secret: 'frontend_secret_1234',
                type: ApiTokenType.FRONTEND,
            });
            await request
                .get('/api/admin/api-tokens')
                .set('Content-Type', 'application/json')
                .expect(200)
                .expect((res) => {
                    expect(res.body.tokens).toHaveLength(1);
                    expect(res.body.tokens[0].type).toBe(ApiTokenType.CLIENT);
                });
            await destroy();
        });
        test('READ_ADMIN_API_TOKEN should be able to see ADMIN tokens', async () => {
            const preHook = (app, config, { userService, accessService }) => {
                app.use('/api/admin/', async (req, res, next) => {
                    const role = await accessService.getRootRole(
                        RoleName.VIEWER,
                    );
                    const user = await userService.createUser({
                        email: 'read_admin_token@example.com',
                        rootRole: role.id,
                    });
                    req.user = user;
                    const readAdminApiToken = await accessService.createRole({
                        name: 'admin_token_reader',
                        description: 'Can read admin tokens',
                        permissions: [],
                        type: 'root-custom',
                    });
                    await accessService.addPermissionToRole(
                        readAdminApiToken.id,
                        READ_API_TOKEN,
                    );
                    await accessService.addPermissionToRole(
                        readAdminApiToken.id,
                        READ_ADMIN_API_TOKEN,
                    );
                    await accessService.addUserToRole(
                        user.id,
                        readAdminApiToken.id,
                        'default',
                    );
                    next();
                });
            };
            const { request, destroy } = await setupAppWithCustomAuth(
                stores,
                preHook,
                {
                    experimental: {
                        flags: {
                            customRootRoles: true,
                        },
                    },
                },
            );
            await stores.apiTokenStore.insert({
                username: 'client',
                secret: 'client_secret_4321',
                type: ApiTokenType.CLIENT,
            });

            await stores.apiTokenStore.insert({
                username: 'admin',
                secret: 'admin_secret_4321',
                type: ApiTokenType.ADMIN,
            });
            await stores.apiTokenStore.insert({
                username: 'frontender',
                secret: 'frontend_secret_4321',
                type: ApiTokenType.FRONTEND,
            });
            await request
                .get('/api/admin/api-tokens')
                .set('Content-Type', 'application/json')
                .expect(200)
                .expect((res) => {
                    expect(res.body.tokens).toHaveLength(1);
                    expect(res.body.tokens[0].type).toBe(ApiTokenType.ADMIN);
                });
            await destroy();
        });
    });
    describe('Update operations', () => {
        describe('UPDATE_CLIENT_API_TOKEN can', () => {
            test('UPDATE client_api token expiry', async () => {
                const preHook = (
                    app,
                    config,
                    { userService, accessService },
                ) => {
                    app.use('/api/admin/', async (req, res, next) => {
                        const role = await accessService.getRootRole(
                            RoleName.VIEWER,
                        );
                        const user = await userService.createUser({
                            email: 'update_client_token@example.com',
                            rootRole: role.id,
                        });
                        req.user = user;
                        const updateClientApiExpiry =
                            await accessService.createRole({
                                name: 'update_client_token',
                                description: 'Can update client tokens',
                                permissions: [],
                                type: 'root-custom',
                            });
                        await accessService.addPermissionToRole(
                            updateClientApiExpiry.id,
                            UPDATE_API_TOKEN,
                        );
                        await accessService.addPermissionToRole(
                            updateClientApiExpiry.id,
                            UPDATE_CLIENT_API_TOKEN,
                        );
                        await accessService.addUserToRole(
                            user.id,
                            updateClientApiExpiry.id,
                            'default',
                        );
                        next();
                    });
                };
                const { request, destroy } = await setupAppWithCustomAuth(
                    stores,
                    preHook,
                    {
                        experimental: {
                            flags: {
                                customRootRoles: true,
                            },
                        },
                    },
                );
                const token = await stores.apiTokenStore.insert({
                    username: 'cilent',
                    secret: 'update_client_token',
                    type: ApiTokenType.CLIENT,
                });
                await request
                    .put(`/api/admin/api-tokens/${token.secret}`)
                    .send({ expiresAt: addDays(new Date(), 14) })
                    .expect(200);
                await destroy();
            });
            test('NOT UPDATE frontend_api token expiry', async () => {
                const preHook = (
                    app,
                    config,
                    { userService, accessService },
                ) => {
                    app.use('/api/admin/', async (req, res, next) => {
                        const role = await accessService.getRootRole(
                            RoleName.VIEWER,
                        );
                        const user = await userService.createUser({
                            email: 'update_frontend_token@example.com',
                            rootRole: role.id,
                        });
                        req.user = user;
                        const updateClientApiExpiry =
                            await accessService.createRole({
                                name: 'update_client_token_not_frontend',
                                description: 'Can not update frontend tokens',
                                permissions: [],
                                type: 'root-custom',
                            });
                        await accessService.addPermissionToRole(
                            updateClientApiExpiry.id,
                            UPDATE_API_TOKEN,
                        );
                        await accessService.addPermissionToRole(
                            updateClientApiExpiry.id,
                            UPDATE_CLIENT_API_TOKEN,
                        );
                        await accessService.addUserToRole(
                            user.id,
                            updateClientApiExpiry.id,
                            'default',
                        );
                        next();
                    });
                };
                const { request, destroy } = await setupAppWithCustomAuth(
                    stores,
                    preHook,
                    {
                        experimental: {
                            flags: {
                                customRootRoles: true,
                            },
                        },
                    },
                );
                const token = await stores.apiTokenStore.insert({
                    username: 'frontend',
                    secret: 'update_frontend_token',
                    type: ApiTokenType.FRONTEND,
                });
                await request
                    .put(`/api/admin/api-tokens/${token.secret}`)
                    .send({ expiresAt: addDays(new Date(), 14) })
                    .expect(403);

                await destroy();
            });
            test('NOT UPDATE admin_api token expiry', async () => {
                const preHook = (
                    app,
                    config,
                    { userService, accessService },
                ) => {
                    app.use('/api/admin/', async (req, res, next) => {
                        const role = await accessService.getRootRole(
                            RoleName.VIEWER,
                        );
                        const user = await userService.createUser({
                            email: 'update_admin_token@example.com',
                            rootRole: role.id,
                        });
                        req.user = user;
                        const updateClientApiExpiry =
                            await accessService.createRole({
                                name: 'update_client_token_not_admin',
                                description: 'Can not update admin tokens',
                                permissions: [],
                                type: 'root-custom',
                            });
                        await accessService.addPermissionToRole(
                            updateClientApiExpiry.id,
                            UPDATE_API_TOKEN,
                        );
                        await accessService.addPermissionToRole(
                            updateClientApiExpiry.id,
                            UPDATE_CLIENT_API_TOKEN,
                        );
                        await accessService.addUserToRole(
                            user.id,
                            updateClientApiExpiry.id,
                            'default',
                        );
                        next();
                    });
                };
                const { request, destroy } = await setupAppWithCustomAuth(
                    stores,
                    preHook,
                    {
                        experimental: {
                            flags: {
                                customRootRoles: true,
                            },
                        },
                    },
                );
                const token = await stores.apiTokenStore.insert({
                    username: 'admin',
                    secret: 'update_admin_token',
                    type: ApiTokenType.ADMIN,
                });
                await request
                    .put(`/api/admin/api-tokens/${token.secret}`)
                    .send({ expiresAt: addDays(new Date(), 14) })
                    .expect(403);
                await destroy();
            });
        });
    });
    describe('Delete operations', () => {
        describe('UPDATE_CLIENT_API_TOKEN can', () => {
            test('delete client_api token', async () => {});
            test('NOT delete frontend_api token', async () => {});
            test('NOT delete admin_api token', async () => {});
        });
    });
});
