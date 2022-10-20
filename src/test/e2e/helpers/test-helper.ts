/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import supertest from 'supertest';

import EventEmitter from 'events';
import getApp from '../../../lib/app';
import { createTestConfig } from '../../config/test-config';
import { IAuthType } from '../../../lib/types/option';
import { createServices } from '../../../lib/services';
import sessionDb from '../../../lib/middleware/session-db';
import { IUnleashServices } from '../../../lib/types/services';
import { ITestDb } from './database-init';

process.env.NODE_ENV = 'test';

export interface IUnleashTest {
    request: supertest.SuperAgentTest;
    destroy: () => Promise<void>;
    services: IUnleashServices;
}

async function createApp(
    db: ITestDb,
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
    const services = createServices(db.stores, config, db.db);
    const unleashSession = sessionDb(config, undefined);
    const emitter = new EventEmitter();
    emitter.setMaxListeners(0);
    const app = await getApp(config, db.stores, services, unleashSession);
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

export async function setupApp(db: ITestDb): Promise<IUnleashTest> {
    return createApp(db);
}

export async function setupAppWithCustomConfig(
    db: ITestDb,
    customOptions: any,
): Promise<IUnleashTest> {
    return createApp(db, undefined, undefined, customOptions);
}

export async function setupAppWithAuth(
    db: ITestDb,
    customOptions?: any,
): Promise<IUnleashTest> {
    return createApp(db, IAuthType.DEMO, undefined, customOptions);
}

export async function setupAppWithCustomAuth(
    db: ITestDb,
    preHook: Function,
): Promise<IUnleashTest> {
    return createApp(db, IAuthType.CUSTOM, preHook);
}
export async function setupAppWithBaseUrl(db: ITestDb): Promise<IUnleashTest> {
    return createApp(db, undefined, undefined, {
        server: {
            unleashUrl: 'http://localhost:4242',
            basePathUri: '/hosted',
        },
    });
}
