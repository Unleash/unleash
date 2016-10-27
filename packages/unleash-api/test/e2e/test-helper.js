'use strict';

process.env.NODE_ENV = 'test';

const BPromise = require('bluebird');
let request = require('supertest');
const databaseUri = require('./database-config').getDatabaseUri();
const knex = require('../../lib/db/db-pool')(databaseUri);
const eventDb = require('../../lib/db/event')(knex);
const EventStore = require('../../lib/event-store');
const eventStore = new EventStore(eventDb);
const featureDb = require('../../lib/db/feature')(knex, eventStore);
const strategyDb = require('../../lib/db/strategy')(knex, eventStore);
const metricsDb = require('../../lib/db/metrics')(knex);


const app = require('../../app')({
    baseUriPath: '',
    db: knex,
    eventDb,
    eventStore,
    featureDb,
    strategyDb,
    metricsDb,
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
    ], strategy => strategyDb._createStrategy(strategy));
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
    ], feature => featureDb._createFeature(feature));
}

function destroyStrategies () {
    return knex('strategies').del();
}

function destroyFeatures () {
    return knex('features').del();
}

function resetDatabase () {
    return BPromise.all([destroyStrategies(), destroyFeatures()]);
}

function setupDatabase () {
    return BPromise.all([createStrategies(), createFeatures()]);
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
