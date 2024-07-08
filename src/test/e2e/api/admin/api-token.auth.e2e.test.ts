import {
    setupAppWithAuth,
    setupAppWithCustomAuth,
} from '../../helpers/test-helper';
import dbInit, { type ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { ApiTokenType } from '../../../../lib/types/models/api-token';
import { RoleName } from '../../../../lib/types/model';
import {
    ADMIN_TOKEN_USER,
    CREATE_CLIENT_API_TOKEN,
    CREATE_PROJECT_API_TOKEN,
    DELETE_CLIENT_API_TOKEN,
    type IUnleashServices,
    type IUnleashStores,
    READ_CLIENT_API_TOKEN,
    READ_FRONTEND_API_TOKEN,
    SYSTEM_USER,
    SYSTEM_USER_AUDIT,
    SYSTEM_USER_ID,
    TEST_AUDIT_USER,
    UPDATE_CLIENT_API_TOKEN,
} from '../../../../lib/types';
import { addDays } from 'date-fns';
import type { AccessService, UserService } from '../../../../lib/services';

let stores: IUnleashStores;
let db: ITestDb;

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

const getLastEvent = async () => {
    const events = await db.stores.eventStore.getEvents();
    return events.reduce((last, current) => {
        if (current.id > last.id) {
            return current;
        }
        return last;
    });
};

test('editor users should only get client or frontend tokens', async () => {
    expect.assertions(3);

    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const role = await accessService.getPredefinedRole(RoleName.EDITOR);
            const user = await userService.createUser({
                email: 'editor@example.com',
                rootRole: role.id,
            });
            req.user = user;
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(
        stores,
        preHook,
        undefined,
        db.rawDatabase,
    );

    await stores.apiTokenStore.insert({
        environment: '',
        projects: [],
        tokenName: '',
        username: 'test',
        secret: '*:environment.1234',
        type: ApiTokenType.CLIENT,
    });

    await stores.apiTokenStore.insert({
        environment: '',
        projects: [],
        tokenName: '',
        username: 'frontend',
        secret: '*:environment.12345',
        type: ApiTokenType.FRONTEND,
    });

    await stores.apiTokenStore.insert({
        environment: '',
        projects: [],
        tokenName: '',
        username: 'test',
        secret: '*:*.sdfsdf2d',
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
            const role = await accessService.getPredefinedRole(RoleName.VIEWER);
            const user = await userService.createUser({
                email: 'viewer@example.com',
                rootRole: role.id,
            });
            req.user = user;
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(
        stores,
        preHook,
        undefined,
        db.rawDatabase,
    );

    await stores.apiTokenStore.insert({
        environment: '',
        projects: [],
        tokenName: '',
        username: 'test',
        secret: '*:environment.1234',
        type: ApiTokenType.CLIENT,
    });

    await stores.apiTokenStore.insert({
        environment: '',
        projects: [],
        tokenName: '',
        username: 'test',
        secret: '*:*.sdfsdf2d',
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
            const role = await accessService.getPredefinedRole(RoleName.EDITOR);
            req.user = await userService.createUser({
                email: 'editor2@example.com',
                rootRole: role.id,
            });
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(
        stores,
        preHook,
        undefined,
        db.rawDatabase,
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

test('Token-admin should be allowed to create token', async () => {
    expect.assertions(0);

    const preHook = (app, config, { userService, accessService }) => {
        app.use('/api/admin/', async (req, res, next) => {
            const role = await accessService.getPredefinedRole(RoleName.ADMIN);
            req.user = await userService.createUser({
                email: 'admin@example.com',
                rootRole: role.id,
            });
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(
        stores,
        preHook,
        undefined,
        db.rawDatabase,
    );

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

test('An admin token should be allowed to create a token', async () => {
    expect.assertions(2);

    const { request, destroy, services } = await setupAppWithAuth(
        stores,
        undefined,
        db.rawDatabase,
    );

    const { secret } =
        await services.apiTokenService.createApiTokenWithProjects(
            {
                tokenName: 'default-admin',
                type: ApiTokenType.ADMIN,
                projects: ['*'],
                environment: '*',
            },
            TEST_AUDIT_USER,
        );

    await request
        .post('/api/admin/api-tokens')
        .send({
            username: 'default-admin',
            type: 'admin',
        })
        .set('Authorization', secret)
        .set('Content-Type', 'application/json')
        .expect(201);

    const event = await getLastEvent();
    expect(event.createdBy).toBe('default-admin');
    expect(event.createdByUserId).toBe(ADMIN_TOKEN_USER.id);
    await destroy();
});

test('A role with only CREATE_PROJECT_API_TOKEN can create project tokens', async () => {
    expect.assertions(0);

    const preHook = (
        app,
        config,
        {
            userService,
            accessService,
        }: { userService: UserService; accessService: AccessService },
    ) => {
        app.use('/api/admin/', async (req, res, next) => {
            const role = (await accessService.getPredefinedRole(
                RoleName.VIEWER,
            ))!;
            const user = await userService.createUser(
                {
                    email: 'powerpuffgirls_viewer@example.com',
                    rootRole: role.id,
                },
                SYSTEM_USER_AUDIT,
            );
            const createClientApiTokenRole = await accessService.createRole(
                {
                    name: 'project_client_token_creator',
                    description: 'Can create client tokens',
                    permissions: [{ name: CREATE_PROJECT_API_TOKEN }],
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
            req.user = user;
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(
        stores,
        preHook,
        {},
        db.rawDatabase,
    );

    await request
        .post('/api/admin/projects/default/api-tokens')
        .send({
            username: 'client-token-maker',
            type: 'client',
            projects: ['default'],
        })
        .set('Content-Type', 'application/json')
        .expect(201);
    await destroy();
});

describe('Fine grained API token permissions', () => {
    describe('A role with access to CREATE_CLIENT_API_TOKEN', () => {
        test('should be allowed to create client tokens', async () => {
            const preHook = (
                app,
                config,
                {
                    userService,
                    accessService,
                }: Pick<IUnleashServices, 'userService' | 'accessService'>,
            ) => {
                app.use('/api/admin/', async (req, res, next) => {
                    const builtInRole = await accessService.getPredefinedRole(
                        RoleName.VIEWER,
                    );
                    const user = await userService.createUser({
                        email: 'mylittlepony_viewer@example.com',
                        rootRole: builtInRole.id,
                    });
                    req.user = user;
                    const createClientApiTokenRole =
                        await accessService.createRole(
                            {
                                name: 'client_token_creator',
                                description: 'Can create client tokens',
                                permissions: [],
                                type: 'root-custom',
                                createdByUserId: SYSTEM_USER.id,
                            },
                            SYSTEM_USER_AUDIT,
                        );
                    // not sure if we should add the permission to the builtin role or to the newly created role
                    await accessService.addPermissionToRole(
                        builtInRole.id,
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
                undefined,
                db.rawDatabase,
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
            const preHook = (
                app,
                config,
                {
                    userService,
                    accessService,
                }: Pick<IUnleashServices, 'userService' | 'accessService'>,
            ) => {
                app.use('/api/admin/', async (req, res, next) => {
                    const role = await accessService.getPredefinedRole(
                        RoleName.VIEWER,
                    );
                    const user = await userService.createUser({
                        email: 'mylittlepony_viewer_frontend@example.com',
                        rootRole: role.id,
                    });
                    req.user = user;
                    const createClientApiTokenRole =
                        await accessService.createRole(
                            {
                                name: 'client_token_creator_cannot_create_frontend',
                                description: 'Can create client tokens',
                                permissions: [],
                                type: 'root-custom',
                                createdByUserId: SYSTEM_USER_ID,
                            },
                            SYSTEM_USER_AUDIT,
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
                undefined,
                db.rawDatabase,
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
            const preHook = (
                app,
                config,
                {
                    userService,
                    accessService,
                }: Pick<IUnleashServices, 'userService' | 'accessService'>,
            ) => {
                app.use('/api/admin/', async (req, res, next) => {
                    const role = await accessService.getPredefinedRole(
                        RoleName.VIEWER,
                    );
                    const user = await userService.createUser({
                        email: 'mylittlepony_admin@example.com',
                        rootRole: role.id,
                    });
                    req.user = user;
                    const createClientApiTokenRole =
                        await accessService.createRole(
                            {
                                name: 'client_token_creator_cannot_create_admin',
                                description: 'Can create client tokens',
                                permissions: [],
                                type: 'root-custom',
                                createdByUserId: SYSTEM_USER_ID,
                            },
                            SYSTEM_USER_AUDIT,
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
                undefined,
                db.rawDatabase,
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
            const preHook = (
                app,
                config,
                {
                    userService,
                    accessService,
                }: Pick<IUnleashServices, 'userService' | 'accessService'>,
            ) => {
                app.use('/api/admin/', async (req, res, next) => {
                    const role = await accessService.getPredefinedRole(
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
                            createdByUserId: SYSTEM_USER_ID,
                        },
                        SYSTEM_USER_AUDIT,
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
                undefined,
                db.rawDatabase,
            );
            await stores.apiTokenStore.insert({
                environment: '',
                projects: [],
                tokenName: '',

                username: 'client',
                secret: '*:environment.client_secret',
                type: ApiTokenType.CLIENT,
            });

            await stores.apiTokenStore.insert({
                environment: '',
                projects: [],
                tokenName: '',
                username: 'admin',
                secret: '*:*.sdfsdf2admin_secret',
                type: ApiTokenType.ADMIN,
            });
            await stores.apiTokenStore.insert({
                environment: '',
                projects: [],
                tokenName: '',
                username: 'frontender',
                secret: '*:environment:sdfsdf2dfrontend_Secret',
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
            const preHook = (
                app,
                config,
                {
                    userService,
                    accessService,
                }: Pick<IUnleashServices, 'userService' | 'accessService'>,
            ) => {
                app.use('/api/admin/', async (req, res, next) => {
                    const role = await accessService.getPredefinedRole(
                        RoleName.VIEWER,
                    );
                    const user = await userService.createUser({
                        email: 'read_client_token@example.com',
                        rootRole: role.id,
                    });
                    req.user = user;
                    const readClientTokenRole = await accessService.createRole(
                        {
                            name: 'client_token_reader',
                            description: 'Can read client tokens',
                            permissions: [],
                            type: 'root-custom',
                            createdByUserId: SYSTEM_USER_ID,
                        },
                        SYSTEM_USER_AUDIT,
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
                undefined,
                db.rawDatabase,
            );
            await stores.apiTokenStore.insert({
                environment: '',
                projects: [],
                tokenName: '',
                username: 'client',
                secret: '*:environment.client_secret_1234',
                type: ApiTokenType.CLIENT,
            });

            await stores.apiTokenStore.insert({
                environment: '',
                projects: [],
                tokenName: '',
                username: 'admin',
                secret: '*:*.admin_secret_1234',
                type: ApiTokenType.ADMIN,
            });
            await stores.apiTokenStore.insert({
                environment: '',
                projects: [],
                tokenName: '',
                username: 'frontender',
                secret: '*:environment.frontend_secret_1234',
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
        test('Admin users should be able to see all tokens', async () => {
            const preHook = (
                app,
                config,
                {
                    userService,
                    accessService,
                }: Pick<IUnleashServices, 'userService' | 'accessService'>,
            ) => {
                app.use('/api/admin/', async (req, res, next) => {
                    const role = await accessService.getPredefinedRole(
                        RoleName.ADMIN,
                    );
                    const user = await userService.createUser({
                        email: 'read_admin_token@example.com',
                        rootRole: role.id,
                    });
                    req.user = user;
                    next();
                });
            };
            const { request, destroy } = await setupAppWithCustomAuth(
                stores,
                preHook,
                undefined,
                db.rawDatabase,
            );
            await stores.apiTokenStore.insert({
                environment: '',
                projects: [],
                tokenName: '',
                username: 'client',
                secret: '*:environment.client_secret_4321',
                type: ApiTokenType.CLIENT,
            });

            await stores.apiTokenStore.insert({
                environment: '',
                projects: [],
                tokenName: '',
                username: 'admin',
                secret: '*:*.admin_secret_4321',
                type: ApiTokenType.ADMIN,
            });
            await stores.apiTokenStore.insert({
                environment: '',
                projects: [],
                tokenName: '',
                username: 'frontender',
                secret: '*:environment.frontend_secret_4321',
                type: ApiTokenType.FRONTEND,
            });
            await request
                .get('/api/admin/api-tokens')
                .set('Content-Type', 'application/json')
                .expect(200)
                .expect((res) => {
                    expect(res.body.tokens).toHaveLength(3);
                });
            await destroy();
        });
        test('Editor users should be able to see all tokens except ADMIN tokens', async () => {
            const preHook = (
                app,
                config,
                {
                    userService,
                    accessService,
                }: Pick<IUnleashServices, 'userService' | 'accessService'>,
            ) => {
                app.use('/api/admin/', async (req, res, next) => {
                    const role = await accessService.getPredefinedRole(
                        RoleName.EDITOR,
                    );
                    const user = await userService.createUser({
                        email: 'standard-editor-reads-tokens@example.com',
                        rootRole: role.id,
                    });
                    req.user = user;
                    next();
                });
            };
            const { request, destroy } = await setupAppWithCustomAuth(
                stores,
                preHook,
                undefined,
                db.rawDatabase,
            );
            await stores.apiTokenStore.insert({
                environment: '',
                projects: [],
                tokenName: '',
                username: 'client',
                secret: '*:environment.client_secret_4321',
                type: ApiTokenType.CLIENT,
            });
            await stores.apiTokenStore.insert({
                environment: '',
                projects: [],
                tokenName: '',
                username: 'admin',
                secret: '*:*.admin_secret_4321',
                type: ApiTokenType.ADMIN,
            });
            await stores.apiTokenStore.insert({
                environment: '',
                projects: [],
                tokenName: '',
                username: 'frontender',
                secret: '*:environment.frontend_secret_4321',
                type: ApiTokenType.FRONTEND,
            });
            await request
                .get('/api/admin/api-tokens')
                .set('Content-Type', 'application/json')
                .expect(200)
                .expect((res) => {
                    expect(res.body.tokens).toHaveLength(2);
                    expect(
                        res.body.tokens.filter(
                            ({ type }) => type === ApiTokenType.ADMIN,
                        ),
                    ).toHaveLength(0);
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
                    {
                        userService,
                        accessService,
                    }: Pick<IUnleashServices, 'userService' | 'accessService'>,
                ) => {
                    app.use('/api/admin/', async (req, res, next) => {
                        const role = await accessService.getPredefinedRole(
                            RoleName.VIEWER,
                        );
                        const user = await userService.createUser({
                            email: 'update_client_token@example.com',
                            rootRole: role.id,
                        });
                        req.user = user;
                        const updateClientApiExpiry =
                            await accessService.createRole(
                                {
                                    name: 'update_client_token',
                                    description: 'Can update client tokens',
                                    permissions: [],
                                    type: 'root-custom',
                                    createdByUserId: SYSTEM_USER_ID,
                                },
                                SYSTEM_USER_AUDIT,
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
                    undefined,
                    db.rawDatabase,
                );
                const token = await stores.apiTokenStore.insert({
                    environment: '',
                    projects: [],
                    tokenName: '',
                    username: 'cilent',
                    secret: '*:environment.update_client_token',
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
                    {
                        userService,
                        accessService,
                    }: Pick<IUnleashServices, 'userService' | 'accessService'>,
                ) => {
                    app.use('/api/admin/', async (req, res, next) => {
                        const role = await accessService.getPredefinedRole(
                            RoleName.VIEWER,
                        );
                        const user = await userService.createUser({
                            email: 'update_frontend_token@example.com',
                            rootRole: role.id,
                        });
                        req.user = user;
                        const updateClientApiExpiry =
                            await accessService.createRole(
                                {
                                    name: 'update_client_token_not_frontend',
                                    description:
                                        'Can not update frontend tokens',
                                    permissions: [],
                                    type: 'root-custom',
                                    createdByUserId: SYSTEM_USER_ID,
                                },
                                SYSTEM_USER_AUDIT,
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
                    undefined,
                    db.rawDatabase,
                );
                const token = await stores.apiTokenStore.insert({
                    environment: '',
                    projects: [],
                    tokenName: '',
                    username: 'frontend',
                    secret: '*:environment.update_frontend_token',
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
                    {
                        userService,
                        accessService,
                    }: Pick<IUnleashServices, 'userService' | 'accessService'>,
                ) => {
                    app.use('/api/admin/', async (req, res, next) => {
                        const role = await accessService.getPredefinedRole(
                            RoleName.VIEWER,
                        );
                        const user = await userService.createUser({
                            email: 'update_admin_token@example.com',
                            rootRole: role.id,
                        });
                        req.user = user;
                        const updateClientApiExpiry =
                            await accessService.createRole(
                                {
                                    name: 'update_client_token_not_admin',
                                    description: 'Can not update admin tokens',
                                    permissions: [],
                                    type: 'root-custom',
                                    createdByUserId: SYSTEM_USER_ID,
                                },
                                SYSTEM_USER_AUDIT,
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
                    undefined,
                    db.rawDatabase,
                );
                const token = await stores.apiTokenStore.insert({
                    environment: '',
                    projects: [],
                    tokenName: '',

                    username: 'admin',
                    secret: '*:*.update_admin_token',
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
        describe('DELETE_CLIENT_API_TOKEN can', () => {
            test('DELETE client_api token', async () => {
                const preHook = (
                    app,
                    config,
                    {
                        userService,
                        accessService,
                    }: Pick<IUnleashServices, 'userService' | 'accessService'>,
                ) => {
                    app.use('/api/admin/', async (req, res, next) => {
                        const role = await accessService.getPredefinedRole(
                            RoleName.VIEWER,
                        );
                        const user = await userService.createUser({
                            email: 'delete_client_token@example.com',
                            rootRole: role.id,
                        });
                        req.user = user;
                        const updateClientApiExpiry =
                            await accessService.createRole(
                                {
                                    name: 'delete_client_token',
                                    description: 'Can delete client tokens',
                                    permissions: [],
                                    type: 'root-custom',
                                    createdByUserId: SYSTEM_USER_ID,
                                },
                                SYSTEM_USER_AUDIT,
                            );
                        await accessService.addPermissionToRole(
                            updateClientApiExpiry.id,
                            DELETE_CLIENT_API_TOKEN,
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
                    undefined,
                    db.rawDatabase,
                );
                const token = await stores.apiTokenStore.insert({
                    environment: '',
                    projects: [],
                    tokenName: '',
                    username: 'cilent',
                    secret: '*:environment.delete_client_token',
                    type: ApiTokenType.CLIENT,
                });
                await request
                    .delete(`/api/admin/api-tokens/${token.secret}`)
                    .send({ expiresAt: addDays(new Date(), 14) })
                    .expect(200);
                await destroy();
            });
            test('NOT DELETE frontend_api token', async () => {
                const preHook = (
                    app,
                    config,
                    {
                        userService,
                        accessService,
                    }: Pick<IUnleashServices, 'userService' | 'accessService'>,
                ) => {
                    app.use('/api/admin/', async (req, res, next) => {
                        const role = await accessService.getPredefinedRole(
                            RoleName.VIEWER,
                        );
                        const user = await userService.createUser({
                            email: 'delete_frontend_token@example.com',
                            rootRole: role.id,
                        });
                        req.user = user;
                        const updateClientApiExpiry =
                            await accessService.createRole(
                                {
                                    name: 'delete_client_token_not_frontend',
                                    description:
                                        'Can not delete frontend tokens',
                                    permissions: [],
                                    type: 'root-custom',
                                    createdByUserId: SYSTEM_USER_ID,
                                },
                                SYSTEM_USER_AUDIT,
                            );
                        await accessService.addPermissionToRole(
                            updateClientApiExpiry.id,
                            DELETE_CLIENT_API_TOKEN,
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
                    undefined,
                    db.rawDatabase,
                );
                const token = await stores.apiTokenStore.insert({
                    environment: '',
                    projects: [],
                    tokenName: '',
                    username: 'frontend',
                    secret: '*:environment.delete_frontend_token',
                    type: ApiTokenType.FRONTEND,
                });
                await request
                    .delete(`/api/admin/api-tokens/${token.secret}`)
                    .send({ expiresAt: addDays(new Date(), 14) })
                    .expect(403);
                await destroy();
            });
            test('NOT DELETE admin_api token', async () => {
                const preHook = (
                    app,
                    config,
                    {
                        userService,
                        accessService,
                    }: Pick<IUnleashServices, 'userService' | 'accessService'>,
                ) => {
                    app.use('/api/admin/', async (req, res, next) => {
                        const role = await accessService.getPredefinedRole(
                            RoleName.VIEWER,
                        );
                        const user = await userService.createUser({
                            email: 'delete_admin_token@example.com',
                            rootRole: role.id,
                        });
                        req.user = user;
                        const updateClientApiExpiry =
                            await accessService.createRole(
                                {
                                    name: 'delete_client_token_not_admin',
                                    description: 'Can not delete admin tokens',
                                    permissions: [],
                                    type: 'root-custom',
                                    createdByUserId: SYSTEM_USER_ID,
                                },
                                SYSTEM_USER_AUDIT,
                            );
                        await accessService.addPermissionToRole(
                            updateClientApiExpiry.id,
                            DELETE_CLIENT_API_TOKEN,
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
                    undefined,
                    db.rawDatabase,
                );
                const token = await stores.apiTokenStore.insert({
                    environment: '',
                    projects: [],
                    tokenName: '',
                    username: 'admin',
                    secret: '*:*:delete_admin_token',
                    type: ApiTokenType.ADMIN,
                });
                await request
                    .delete(`/api/admin/api-tokens/${token.secret}`)
                    .send({ expiresAt: addDays(new Date(), 14) })
                    .expect(403);
                await destroy();
            });
        });
    });
});
