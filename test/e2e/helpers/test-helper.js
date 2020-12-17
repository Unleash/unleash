'use strict';

process.env.NODE_ENV = 'test';

const supertest = require('supertest');

const { EventEmitter } = require('events');
const getApp = require('../../../lib/app');
const getLogger = require('../../fixtures/no-logger');
const StateService = require('../../../lib/services/state-service');

const eventBus = new EventEmitter();

function createApp(stores, adminAuthentication = 'none', preHook) {
    const services = {
        stateService: new StateService(stores, { getLogger }),
    };
    return getApp(
        {
            stores,
            eventBus,
            preHook,
            adminAuthentication,
            secret: 'super-secret',
            sessionAge: 4000,
            getLogger,
        },
        services,
    );
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
