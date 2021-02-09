'use strict';

process.env.NODE_ENV = 'test';

// eslint-disable-next-line import/no-extraneous-dependencies
const supertest = require('supertest');

const { EventEmitter } = require('events');
const getApp = require('../../../app');
const getLogger = require('../../fixtures/no-logger');
const { createServices } = require('../../../services');

const eventBus = new EventEmitter();

function createApp(stores, adminAuthentication = 'none', preHook) {
    const config = {
        stores,
        eventBus,
        preHook,
        adminAuthentication,
        secret: 'super-secret',
        sessionAge: 4000,
        getLogger,
    };
    const services = createServices(stores, config);
    // TODO: use create from server-impl instead?
    return getApp(config, services);
}

module.exports = {
    async setupApp(stores) {
        const app = createApp(stores);
        return supertest.agent(app);
    },

    async setupAppWithAuth(stores) {
        const app = createApp(stores, 'unsecure');
        return supertest.agent(app);
    },

    async setupAppWithCustomAuth(stores, preHook) {
        const app = createApp(stores, 'custom', preHook);
        return supertest.agent(app);
    },
};
