'use strict';

process.env.NODE_ENV = 'test';

const supertest = require('supertest');

const { EventEmitter } = require('events');
const getApp = require('../../../lib/app');
const getLogger = require('../../fixtures/no-logger');
const StateService = require('../../../lib/state-service');

const eventBus = new EventEmitter();

function createApp(stores, adminAuthentication = 'none', preHook) {
    return getApp({
        stores,
        eventBus,
        preHook,
        adminAuthentication,
        secret: 'super-secret',
        sessionAge: 4000,
        stateService: new StateService({ stores, getLogger }),
        getLogger,
    });
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
