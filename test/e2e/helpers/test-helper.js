'use strict';

process.env.NODE_ENV = 'test';

const supertest = require('supertest');

const getApp = require('../../../lib/app');
const dbInit = require('./database-init');
const getLogger = require('../../fixtures/no-logger');
const StateService = require('../../../lib/state-service');

const { EventEmitter } = require('events');
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
    async setupApp(name) {
        const stores = await dbInit(name, getLogger);
        const app = createApp(stores);

        return {
            request: supertest.agent(app),
            destroy: () => stores.db.destroy(),
        };
    },
    async setupAppWithAuth(name) {
        const stores = await dbInit(name, getLogger);
        const app = createApp(stores, 'unsecure');

        return {
            request: supertest.agent(app),
            destroy: () => stores.db.destroy(),
        };
    },

    async setupAppWithCustomAuth(name, preHook) {
        const stores = await dbInit(name, getLogger);
        const app = createApp(stores, 'custom', preHook);

        return {
            request: supertest.agent(app),
            destroy: () => stores.db.destroy(),
        };
    },
};
