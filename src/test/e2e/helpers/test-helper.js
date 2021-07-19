'use strict';

process.env.NODE_ENV = 'test';
/* eslint-disable-next-line */
const supertest = require('supertest');

const getApp = require('../../../lib/app');
const { createTestConfig } = require('../../config/test-config');
const { IAuthType } = require('../../../lib/types/option');
const { createServices } = require('../../../lib/services');

function createApp(
    stores,
    adminAuthentication = IAuthType.NONE,
    preHook,
    customOptions,
) {
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

    const app = getApp(config, stores, services);
    const request = supertest.agent(app);

    const destroy = async () => {
        services.versionService.destroy();
        services.clientMetricsService.destroy();
        services.apiTokenService.destroy();
    };

    // TODO: use create from server-impl instead?
    return { request, destroy, services };
}

module.exports = {
    async setupApp(stores) {
        return createApp(stores);
    },

    async setupAppWithCustomConfig(stores, customOptions) {
        return createApp(stores, undefined, undefined, customOptions);
    },

    async setupAppWithAuth(stores) {
        return createApp(stores, IAuthType.DEMO);
    },

    async setupAppWithCustomAuth(stores, preHook) {
        return createApp(stores, IAuthType.CUSTOM, preHook);
    },
    async setupAppWithBaseUrl(stores) {
        return createApp(stores, undefined, undefined, {
            server: {
                unleashUrl: 'http://localhost:4242',
                basePathUri: '/hosted',
            },
        });
    },
};
