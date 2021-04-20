'use strict';

process.env.NODE_ENV = 'test';
/* eslint-disable-next-line */
const supertest = require('supertest');

const getApp = require('../../../lib/app');
const getLogger = require('../../fixtures/no-logger');
const createConfig = require('../../../lib/create-config');
const { AuthType } = require('../../../lib/types/option');
const { createServices } = require('../../../lib/services');

function createApp(stores, adminAuthentication = AuthType.NONE, preHook) {
    const config = createConfig({
        authentication: {
            type: adminAuthentication,
            customAuthHandler: preHook,
        },
        server: {
            unleashUrl: 'http://localhost:4242',
        },
        getLogger,
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
        const app = createApp(stores, AuthType.DEMO);
        return supertest.agent(app);
    },

    async setupAppWithCustomAuth(stores, preHook) {
        const app = createApp(stores, AuthType.CUSTOM, preHook);
        return supertest.agent(app);
    },
};
