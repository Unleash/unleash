'use strict';

process.env.NODE_ENV = 'test';
/* eslint-disable-next-line */
const supertest = require('supertest');

const getApp = require('../../../lib/app');
const { createTestConfig } = require('../../config/test-config');
const { IAuthType } = require('../../../lib/types/option');
const { createServices } = require('../../../lib/services');

function createApp(stores, adminAuthentication = IAuthType.NONE, preHook) {
    const config = createTestConfig({
        authentication: {
            type: adminAuthentication,
            customAuthHandler: preHook,
        },
        server: {
            unleashUrl: 'http://localhost:4242',
        },
    });
    const services = createServices(stores, config);
    // TODO: use create from server-impl instead?
    return getApp(config, stores, services);
}

module.exports = {
    async setupApp(stores) {
        const app = createApp(stores);
        return supertest.agent(app);
    },

    async setupAppWithAuth(stores) {
        const app = createApp(stores, IAuthType.DEMO);
        return supertest.agent(app);
    },

    async setupAppWithCustomAuth(stores, preHook) {
        const app = createApp(stores, IAuthType.CUSTOM, preHook);
        return supertest.agent(app);
    },
};
