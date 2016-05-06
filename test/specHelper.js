'use strict';
process.env.NODE_ENV = 'test';

var Promise    = require('bluebird');
var request    = require('supertest');
var app        = require('../app');
var knex       = require('../lib/dbPool');
var featureDb  = require('../lib/featureDb');
var strategyDb = require('../lib/strategyDb');

Promise.promisifyAll(request);
request = request(app);

function createStrategies() {
    return Promise.map([
        {
            name: "default",
            description: "Default on or off Strategy.",
            parametersTemplate: {}
        },
        {
            name: "usersWithEmail",
            description: "Active for users defined  in the comma-separated emails-parameter.",
            parametersTemplate: {
                emails: "String"
            }
        }
    ], function (strategy) {
        return strategyDb._createStrategy(strategy);
    });
}

function createFeatures() {
    return Promise.map([
        {
            "name": "featureX",
            "description": "the #1 feature",
            "enabled": true,
            "strategy": "default"
        },
        {
            "name": "featureY",
            "description": "soon to be the #1 feature",
            "enabled": false,
            "strategy": "baz",
            "parameters": {
                "foo": "bar"
            }
        },
        {
            "name": "featureZ",
            "description": "terrible feature",
            "enabled": true,
            "strategy": "baz",
            "parameters": {
                "foo": "rab"
            }
        },
        {
            "name": "featureArchivedX",
            "description": "the #1 feature",
            "enabled": true,
            "archived": true,
            "strategy": "default"
        },
        {
            "name": "featureArchivedY",
            "description": "soon to be the #1 feature",
            "enabled": false,
            "archived": true,
            "strategy": "baz",
            "parameters": {
                "foo": "bar"
            }
        },
        {
            "name": "featureArchivedZ",
            "description": "terrible feature",
            "enabled": true,
            "archived": true,
            "strategy": "baz",
            "parameters": {
                "foo": "rab"
            }
        }
    ], function (feature) {
        return featureDb._createFeature(feature);
    });
}

function destroyStrategies() {
    return knex('strategies').del();
}

function destroyFeatures() {
    return knex('features').del();
}

function resetDatabase() {
    return Promise.all([destroyStrategies(), destroyFeatures()]);
}

function setupDatabase() {
    return Promise.all([createStrategies(), createFeatures()]);
}

module.exports = {
    request: request,
    db: {
        reset: resetDatabase,
        setup: setupDatabase,
        resetAndSetup: function () {
            return resetDatabase().then(setupDatabase);
        }
    }
};
