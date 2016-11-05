'use strict';

process.env.NODE_ENV = 'test';

// Mute migrator
require('db-migrate-shared').log.silence(true);

const BPromise = require('bluebird');
let request = require('supertest');
const migrator = require('../../migrator');

const options = {
    databaseUri: require('./database-config').getDatabaseUri(),
};

const { createStores } = require('../../lib/db');

const stores = createStores(options);

const app = require('../../app')({
    baseUriPath: '',
    stores,
});

BPromise.promisifyAll(request);
request = request(app);

function createStrategies () {
    return BPromise.map([
        {
            name: 'default',
            description: 'Default on or off Strategy.',
            parametersTemplate: {},
        },
        {
            name: 'usersWithEmail',
            description: 'Active for users defined  in the comma-separated emails-parameter.',
            parametersTemplate: {
                emails: 'String',
            },
        },
    ], strategy => stores.strategyStore._createStrategy(strategy));
}

function createFeatures () {
    return BPromise.map([
        {
            name: 'featureX',
            description: 'the #1 feature',
            enabled: true,
            strategies: [{ name: 'default', parameters: {} }],
        },
        {
            name: 'featureY',
            description: 'soon to be the #1 feature',
            enabled: false,
            strategies: [{
                name: 'baz',
                parameters: {
                    foo: 'bar',
                },
            }],
        },
        {
            name: 'featureZ',
            description: 'terrible feature',
            enabled: true,
            strategies: [{
                name: 'baz',
                parameters: {
                    foo: 'rab',
                },
            }],
        },
        {
            name: 'featureArchivedX',
            description: 'the #1 feature',
            enabled: true,
            archived: true,
            strategies: [{ name: 'default', parameters: {} }],
        },
        {
            name: 'featureArchivedY',
            description: 'soon to be the #1 feature',
            enabled: false,
            archived: true,
            strategies: [{
                name: 'baz',
                parameters: {
                    foo: 'bar',
                },
            }],
        },
        {
            name: 'featureArchivedZ',
            description: 'terrible feature',
            enabled: true,
            archived: true,
            strategies: [{
                name: 'baz',
                parameters: {
                    foo: 'rab',
                },
            }],
        },
    ], feature => stores.featureToggleStore._createFeature(feature));
}

function destroyStrategies () {
    return stores.db('strategies').del();
}

function destroyFeatures () {
    return stores.db('features').del();
}

function resetDatabase () {
    return BPromise.all([destroyStrategies(), destroyFeatures()]);
}

function setupDatabase () {
    return BPromise.all([migrator(options.databaseUri), createStrategies(), createFeatures()]);
}

module.exports = {
    request,
    db: {
        reset: resetDatabase,
        setup: setupDatabase,
        resetAndSetup () {
            return resetDatabase().then(setupDatabase);
        },
    },
};
