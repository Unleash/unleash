/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import supertest from 'supertest';

import EventEmitter from 'events';
import getApp from '../../../lib/app';
import { createTestConfig } from '../../config/test-config';
import { IAuthType } from '../../../lib/types/option';
import { createServices } from '../../../lib/services';
import sessionDb from '../../../lib/middleware/session-db';
import { IUnleashStores } from '../../../lib/types';
import { IUnleashServices } from '../../../lib/types/services';

process.env.NODE_ENV = 'test';

export interface IUnleashTest {
    request: supertest.SuperAgentTest;
    destroy: () => Promise<void>;
    services: IUnleashServices;
}

async function createApp(
    stores,
    adminAuthentication = IAuthType.NONE,
    preHook?: Function,
    customOptions?: any,
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
    const services = createServices(stores, config);
    const unleashSession = sessionDb(config, undefined);
    const emitter = new EventEmitter();
    emitter.setMaxListeners(0);
    const app = await getApp(config, stores, services, unleashSession);
    const request = supertest.agent(app);

    const destroy = async () => {
        services.versionService.destroy();
        services.clientInstanceService.destroy();
        services.clientMetricsServiceV2.destroy();
        services.apiTokenService.destroy();
    };

    // TODO: use create from server-impl instead?
    return { request, destroy, services };
}

export async function setupApp(stores: IUnleashStores): Promise<IUnleashTest> {
    return createApp(stores);
}

export async function setupAppWithCustomConfig(
    stores: IUnleashStores,
    customOptions: any,
): Promise<IUnleashTest> {
    return createApp(stores, undefined, undefined, customOptions);
}

export async function setupAppWithAuth(
    stores: IUnleashStores,
    customOptions?: any,
): Promise<IUnleashTest> {
    return createApp(stores, IAuthType.DEMO, undefined, customOptions);
}

export async function setupAppWithCustomAuth(
    stores: IUnleashStores,
    preHook: Function,
): Promise<IUnleashTest> {
    return createApp(stores, IAuthType.CUSTOM, preHook);
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
