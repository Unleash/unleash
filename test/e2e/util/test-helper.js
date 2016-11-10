'use strict';

process.env.NODE_ENV = 'test';

let supertest = require('supertest');

const options = {
    databaseUri: require('./database-config').getDatabaseUri(),
};

const migrator = require('../../../migrator');
const { createStores } = require('../../../lib/db');

process.env.DATABASE_URL = options.databaseUri

const createApp =  migrator(options.databaseUri).then(() => {
    const stores = createStores(options);
    const app = require('../../../app')({stores});
    return { stores, request: supertest(app) };
});

function createStrategies (stores) {
    return [
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
    ].map(strategy => stores.strategyStore._createStrategy(strategy));
}

function createFeatures (stores) {
    return [
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
    ].map(feature => stores.featureToggleStore._createFeature(feature));
}

function destroyStrategies (stores) {
    return stores.db('strategies').del();
}

function destroyFeatures (stores) {
    return stores.db('features').del();
}

function resetDatabase (stores) {
    return Promise.all([destroyStrategies(stores), destroyFeatures(stores)]);
}

function setupDatabase (stores) {
    return Promise.all(createStrategies(stores).concat(createFeatures(stores)))
}

module.exports = {
    setupApp () {
        return createApp.then((app) => {
            return resetDatabase(app.stores)
            .then(() => setupDatabase(app.stores))
            .then(() => app);
        });
    }
};
