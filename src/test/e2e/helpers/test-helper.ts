import supertest from 'supertest';

import getApp from '../../../lib/app.js';
import { createTestConfig } from '../../config/test-config.js';
import { IAuthType, type IUnleashConfig } from '../../../lib/types/option.js';
import { createServices } from '../../../lib/services/index.js';
import sessionDb from '../../../lib/middleware/session-db.js';
import {
    DEFAULT_PROJECT,
    type FeatureToggleDTO,
    type IUnleashStores,
} from '../../../lib/types/index.js';
import type { IUnleashServices } from '../../../lib/services/index.js';
import type { Db } from '../../../lib/db/db.js';
import type { IContextFieldDto } from '../../../lib/features/context/context-field-store-type.js';
import { DEFAULT_ENV } from '../../../lib/util/index.js';
import type {
    CreateDependentFeatureSchema,
    CreateFeatureSchema,
    CreateFeatureStrategySchema,
    ImportTogglesSchema,
} from '../../../lib/openapi/index.js';
import type { Knex } from 'knex';
import type TestAgent from 'supertest/lib/agent.d.ts';
import type Test from 'supertest/lib/test.d.ts';
import type { Server } from 'node:http';
import {
    initialServiceSetup,
    type IUser,
    type RoleName,
} from '../../../lib/server-impl.js';
import type { EventSearchQueryParameters } from '../../../lib/openapi/spec/event-search-query-parameters.js';
process.env.NODE_ENV = 'test';

type DemoLoginArgs = {
    email: string;
};

type SimpleLoginArgs = {
    username: string;
    password: string;
};

export interface IUnleashTest extends IUnleashHttpAPI {
    request: TestAgent<Test>;
    destroy: () => Promise<void>;
    services: IUnleashServices;
    config: IUnleashConfig;
}

export interface IUnleashNoSupertest {
    server: Server;
    services: IUnleashServices;
    config: IUnleashConfig;
    destroy: () => Promise<void>;
}

/**
 * This is a collection of API helpers. The response code is optional, and should default to the success code for the request.
 *
 * All functions return a supertest.Test object, which can be used to compose more assertions on the response.
 */
export interface IUnleashHttpAPI {
    addStrategyToFeatureEnv(
        postData: CreateFeatureStrategySchema,
        envName: string,
        featureName: string,
        project?: string,
        expectStatusCode?: number,
    ): supertest.Test;

    createFeature(
        feature: string | CreateFeatureSchema,
        project?: string,
        expectedResponseCode?: number,
    ): supertest.Test;

    enableFeature(
        feature: string,
        environment: string,
        project?: string,
        expectedResponseCode?: number,
    ): supertest.Test;

    favoriteFeature(
        feature: string,
        project?: string,
        expectedResponseCode?: number,
    ): supertest.Test;

    getFeatures(name?: string, expectedResponseCode?: number): supertest.Test;

    getProjectFeatures(
        project: string,
        name?: string,
        expectedResponseCode?: number,
    ): supertest.Test;

    archiveFeature(
        name: string,
        project?: string,
        expectedResponseCode?: number,
    ): supertest.Test;

    createContextField(
        contextField: IContextFieldDto,
        expectedResponseCode?: number,
    ): supertest.Test;

    linkProjectToEnvironment(
        project: string,
        environment: string,
        expectedResponseCode?: number,
    ): supertest.Test;

    importToggles(
        importPayload: ImportTogglesSchema,
        expectedResponseCode?: number,
    ): supertest.Test;

    addDependency(
        child: string,
        parent: string | CreateDependentFeatureSchema,
    ): supertest.Test;

    addTag(
        feature: string,
        tag: { type: string; value: string },
        expectedResponseCode?: number,
    ): supertest.Test;

    getRecordedEvents(
        queryParams?: EventSearchQueryParameters,
        expectedResponseCode?: number,
    ): supertest.Test;

    createSegment(postData: object, expectStatusCode?: number): supertest.Test;
    deleteSegment(
        segmentId: number,
        expectedResponseCode?: number,
    ): supertest.Test;
    updateSegment(
        segmentId: number,
        postData: object,
        expectStatusCode?: number,
    ): supertest.Test;

    login(args: DemoLoginArgs | SimpleLoginArgs): supertest.Test;
}

function httpApis(
    request: TestAgent<Test>,
    config: IUnleashConfig,
): IUnleashHttpAPI {
    const base = config.server.baseUriPath || '';

    return {
        addStrategyToFeatureEnv: (
            postData: CreateFeatureStrategySchema,
            envName: string,
            featureName: string,
            project: string = DEFAULT_PROJECT,
            expectStatusCode: number = 200,
        ) => {
            const url = `${base}/api/admin/projects/${project}/features/${featureName}/environments/${envName}/strategies`;
            return request.post(url).send(postData).expect(expectStatusCode);
        },
        createFeature: (
            feature: string | FeatureToggleDTO,
            project: string = DEFAULT_PROJECT,
            expectedResponseCode: number = 201,
        ) => {
            let body = feature;
            if (typeof feature === 'string') {
                body = {
                    name: feature,
                };
            }
            return request
                .post(`${base}/api/admin/projects/${project}/features`)
                .send(body)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },

        getFeatures(
            name?: string,
            expectedResponseCode: number = 200,
        ): supertest.Test {
            const featuresUrl = `/api/admin/features${name ? `/${name}` : ''}`;
            return request
                .get(featuresUrl)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },

        getProjectFeatures(
            project: string = DEFAULT_PROJECT,
            name?: string,
            expectedResponseCode: number = 200,
        ): supertest.Test {
            const featuresUrl = `/api/admin/projects/${project}/features${
                name ? `/${name}` : ''
            }`;
            return request
                .get(featuresUrl)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },

        archiveFeature(
            name: string,
            project: string = DEFAULT_PROJECT,
            expectedResponseCode: number = 202,
        ): supertest.Test {
            return request
                .delete(
                    `${base}/api/admin/projects/${project}/features/${name}`,
                )
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },

        createContextField(
            contextField: IContextFieldDto,
            expectedResponseCode: number = 201,
        ): supertest.Test {
            return request
                .post(`${base}/api/admin/context`)
                .send(contextField)
                .expect(expectedResponseCode);
        },

        linkProjectToEnvironment(
            project: string,
            environment: string = DEFAULT_ENV,
            expectedResponseCode: number = 200,
        ): supertest.Test {
            return request
                .post(`${base}/api/admin/projects/${project}/environments`)
                .send({
                    environment,
                })
                .expect(expectedResponseCode);
        },

        importToggles(
            importPayload: ImportTogglesSchema,
            expectedResponseCode: number = 200,
        ): supertest.Test {
            return request
                .post('/api/admin/features-batch/import')
                .send(importPayload)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },

        addDependency(
            child: string,
            parent: string | CreateDependentFeatureSchema,
            project = DEFAULT_PROJECT,
            expectedResponseCode: number = 200,
        ): supertest.Test {
            return request
                .post(
                    `/api/admin/projects/${project}/features/${child}/dependencies`,
                )
                .send(typeof parent === 'string' ? { feature: parent } : parent)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },

        addTag(
            feature: string,
            tag: { type: string; value: string },
            expectedResponseCode: number = 201,
        ): supertest.Test {
            return request
                .post(`/api/admin/features/${feature}/tags`)
                .send({ type: tag.type, value: tag.value })
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },

        enableFeature(
            feature: string,
            environment,
            project = 'default',
            expectedResponseCode = 200,
        ): supertest.Test {
            return request
                .post(
                    `/api/admin/projects/${project}/features/${feature}/environments/${environment}/on`,
                )
                .expect(expectedResponseCode);
        },

        favoriteFeature(
            feature: string,
            project = 'default',
            expectedResponseCode = 200,
        ): supertest.Test {
            return request
                .post(
                    `/api/admin/projects/${project}/features/${feature}/favorites`,
                )
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },
        createSegment(
            postData: object,
            expectedResponseCode = 201,
        ): supertest.Test {
            return request
                .post(`/api/admin/segments`)
                .send(postData)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },
        deleteSegment(
            segmentId: number,
            expectedResponseCode = 204,
        ): supertest.Test {
            return request
                .delete(`/api/admin/segments/${segmentId}`)
                .set('Content-Type', 'application/json')
                .expect(expectedResponseCode);
        },
        updateSegment(
            segmentId: number,
            postData: object,
            expectStatusCode = 204,
        ): supertest.Test {
            return request
                .put(`/api/admin/segments/${segmentId}`)
                .send(postData)
                .expect(expectStatusCode);
        },
        getRecordedEvents(
            queryParams: EventSearchQueryParameters = {},
            expectedResponseCode: number = 200,
        ): supertest.Test {
            const query = new URLSearchParams(queryParams as any).toString();
            return request
                .get(`/api/admin/search/events${query ? `?${query}` : ''}`)
                .expect(expectedResponseCode);
        },
        login(args: DemoLoginArgs | SimpleLoginArgs): supertest.Test {
            if ('email' in args) {
                const { email } = args;
                return request
                    .post(`${base}/auth/demo/login`)
                    .send({ email })
                    .expect(200);
            }

            const { username, password } = args;
            return request
                .post(`${base}/auth/simple/login`)
                .send({
                    username,
                    password,
                } as SimpleLoginArgs)
                .expect(200);
        },
    };
}

async function createApp(
    stores,
    adminAuthentication = IAuthType.NONE,
    preHook?: Function,
    customOptions?: any,
    db?: Db,
): Promise<IUnleashTest> {
    const config = createTestConfig({
        authentication: {
            type: adminAuthentication,
            customAuthHandler: preHook,
        },
        server: {
            unleashUrl: 'http://localhost:4242',
        },
        disableScheduler: true,
        ...{
            ...customOptions,
            experimental: {
                ...(customOptions?.experimental ?? {}),
                flags: {
                    strictSchemaValidation: true,
                    ...(customOptions?.experimental?.flags ?? {}),
                },
            },
        },
    });
    const services = createServices(stores, config, db);
    await initialServiceSetup(config, services);
    // @ts-expect-error We don't have a database for sessions here.
    const unleashSession = sessionDb(config, undefined);
    const app = await getApp(config, stores, services, unleashSession, db);
    const request = supertest.agent(app);

    const destroy = async () => {
        // iterate on the keys of services and if the services at that key has a function called destroy then call it
        await Promise.all(
            Object.keys(services).map(async (key) => {
                if (services[key].destroy) {
                    await services[key].destroy();
                }
            }),
        );
    };

    // TODO: use create from server-impl instead?
    return {
        request,
        destroy,
        services,
        config,
        ...httpApis(request, config),
    };
}

export async function setupApp(stores: IUnleashStores): Promise<IUnleashTest> {
    return createApp(stores);
}

export async function setupAppWithoutSupertest(
    stores,
    customOptions?: any,
    db?: Db,
): Promise<IUnleashNoSupertest> {
    const config = createTestConfig({
        authentication: {
            type: IAuthType.DEMO,
        },
        server: {
            unleashUrl: 'http://localhost:4242',
        },
        disableScheduler: true,
        ...{
            ...customOptions,
            experimental: {
                ...(customOptions?.experimental ?? {}),
                flags: {
                    strictSchemaValidation: true,
                    ...(customOptions?.experimental?.flags ?? {}),
                },
            },
        },
    });
    const services = createServices(stores, config, db);
    await initialServiceSetup(config, services);
    // @ts-expect-error we don't have a db for the session here
    const unleashSession = sessionDb(config, undefined);
    const app = await getApp(config, stores, services, unleashSession, db);
    const server = app.listen(0);
    const destroy = async () => {
        // iterate on the keys of services and if the services at that key has a function called destroy then call it
        await Promise.all(
            Object.keys(services).map(async (key) => {
                if (services[key].destroy) {
                    await services[key].destroy();
                }
            }),
        );
        await server.close();
    };
    return {
        server,
        destroy,
        services,
        config,
    };
}

export async function setupAppWithCustomConfig(
    stores: IUnleashStores,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    customOptions: any,
    db?: Db,
): Promise<IUnleashTest> {
    return createApp(stores, undefined, undefined, customOptions, db);
}

export async function setupAppWithAuth(
    stores: IUnleashStores,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    customOptions?: any,
    db?: Db,
): Promise<IUnleashTest> {
    return createApp(stores, IAuthType.DEMO, undefined, customOptions, db);
}

export async function setupAppWithCustomAuth(
    stores: IUnleashStores,
    preHook?: Function,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    customOptions?: any,
    db?: Db,
): Promise<IUnleashTest> {
    return createApp(stores, IAuthType.CUSTOM, preHook, customOptions, db);
}

export async function setupAppWithBaseUrl(
    stores: IUnleashStores,
    baseUriPath = '/hosted',
): Promise<IUnleashTest> {
    return createApp(stores, undefined, undefined, {
        server: {
            unleashUrl: 'http://localhost:4242',
            baseUriPath,
        },
    });
}

export const insertLastSeenAt = async (
    featureName: string,
    db: Knex,
    environment: string = DEFAULT_ENV,
    date: string = '2023-10-01T12:34:56.000Z',
): Promise<string> => {
    try {
        await db.raw(`INSERT INTO last_seen_at_metrics (feature_name, environment, last_seen_at)
        VALUES ('${featureName}', '${environment}', '${date}');`);

        return date;
    } catch (err) {
        console.log(err);
        return Promise.resolve('');
    }
};

export const insertFeatureEnvironmentsLastSeen = async (
    featureName: string,
    db: Knex,
    environment: string = 'default',
    date: string = '2022-05-01T12:34:56.000Z',
): Promise<string> => {
    await db.raw(`
        INSERT INTO feature_environments (feature_name, environment, last_seen_at, enabled)
        VALUES ('${featureName}', '${environment}', '${date}', true)
        ON CONFLICT (feature_name, environment) DO UPDATE SET last_seen_at = '${date}', enabled = true;
    `);

    return date;
};

export const createUserWithRootRole = async ({
    app,
    stores,
    email,
    name = email,
    roleName,
}: {
    app: IUnleashTest;
    stores: IUnleashStores;
    name?: string;
    email: string;
    roleName?: RoleName;
}): Promise<IUser> => {
    const createdUser = await stores.userStore.insert({
        name,
        email,
    });

    if (roleName) {
        const roles = await app.services.accessService.getRootRoles();
        const role = roles.find((role) => role.name === roleName);

        if (!role) {
            throw new Error(`Role ${roleName} not found`);
        }

        await app.services.accessService.addUserToRole(
            createdUser.id,
            role.id,
            'default',
        );
    }

    return createdUser;
};
