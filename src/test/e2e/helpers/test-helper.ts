import supertest from 'supertest';

import EventEmitter from 'events';
import getApp from '../../../lib/app';
import { createTestConfig } from '../../config/test-config';
import { IAuthType, IUnleashConfig } from '../../../lib/types/option';
import { createServices } from '../../../lib/services';
import sessionDb from '../../../lib/middleware/session-db';
import { DEFAULT_PROJECT, IUnleashStores } from '../../../lib/types';
import { IUnleashServices } from '../../../lib/types/services';
import { Db } from '../../../lib/db/db';
import { IContextFieldDto } from 'lib/types/stores/context-field-store';
import { DEFAULT_ENV } from '../../../lib/util';
import { CreateFeatureSchema, ImportTogglesSchema } from '../../../lib/openapi';

process.env.NODE_ENV = 'test';

export interface IUnleashTest extends IUnleashHttpAPI {
    request: supertest.SuperAgentTest;
    destroy: () => Promise<void>;
    services: IUnleashServices;
    config: IUnleashConfig;
}

/**
 * This is a collection of API helpers. The response code is optional, and should default to the success code for the request.
 *
 * All functions return a supertest.Test object, which can be used to compose more assertions on the response.
 */
export interface IUnleashHttpAPI {
    createFeature(
        feature: string | CreateFeatureSchema,
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
}

function httpApis(
    request: supertest.SuperAgentTest,
    config: IUnleashConfig,
): IUnleashHttpAPI {
    const base = config.server.baseUriPath || '';

    return {
        createFeature: (
            feature: string | CreateFeatureSchema,
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
        ...customOptions,
    });
    const services = createServices(stores, config, db);
    const unleashSession = sessionDb(config, undefined);
    const emitter = new EventEmitter();
    emitter.setMaxListeners(0);
    const app = await getApp(config, stores, services, unleashSession, db);
    const request = supertest.agent(app);

    const destroy = async () => {
        services.versionService.destroy();
        services.clientInstanceService.destroy();
        services.clientMetricsServiceV2.destroy();
        services.proxyService.destroy();
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
    preHook: Function,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    customOptions?: any,
): Promise<IUnleashTest> {
    return createApp(stores, IAuthType.CUSTOM, preHook, customOptions);
}

export async function setupAppWithBaseUrl(
    stores: IUnleashStores,
): Promise<IUnleashTest> {
    return createApp(stores, undefined, undefined, {
        server: {
            unleashUrl: 'http://localhost:4242',
            basePathUri: '/hosted',
        },
    });
}
