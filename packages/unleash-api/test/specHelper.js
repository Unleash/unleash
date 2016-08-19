'use strict';
process.env.NODE_ENV = 'test';

const BPromise = require('bluebird');
let request = require('supertest');
const databaseUri = require('./databaseConfig').getDatabaseUri();
const knex = require('../lib/db/dbPool')(databaseUri);
const eventDb = require('../lib/db/event')(knex);
const EventStore = require('../lib/eventStore');
const eventStore = new EventStore(eventDb);
const featureDb = require('../lib/db/feature')(knex, eventStore);
const strategyDb = require('../lib/db/strategy')(knex, eventStore);

const app = require('../app')({
    baseUriPath: '',
    db: knex,
    eventDb,
    eventStore,
    featureDb,
    strategyDb,
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
            strategy: 'default',
        },
        {
            name: 'featureY',
            description: 'soon to be the #1 feature',
            enabled: false,
            strategy: 'baz',
            parameters: {
                foo: 'bar',
            },
        },
        {
            name: 'featureZ',
            description: 'terrible feature',
            enabled: true,
            strategy: 'baz',
            parameters: {
                foo: 'rab',
            },
        },
        {
            name: 'featureArchivedX',
            description: 'the #1 feature',
            enabled: true,
            archived: true,
            strategy: 'default',
        },
        {
            name: 'featureArchivedY',
            description: 'soon to be the #1 feature',
            enabled: false,
            archived: true,
            strategy: 'baz',
            parameters: {
                foo: 'bar',
            },
        },
        {
            name: 'featureArchivedZ',
            description: 'terrible feature',
            enabled: true,
            archived: true,
            strategy: 'baz',
            parameters: {
                foo: 'rab',
            },
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
