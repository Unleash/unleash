process.env.NODE_ENV = 'test';

var Promise = require('bluebird');
var request = require('supertest');
var app     = require('../app');
var knex    = require('../lib/dbPool');

Promise.promisifyAll(request);
request = request(app);

function createStrategies() {
    return Promise.map([
        {
            name: "default",
            description: "Default on or off Strategy."
        },
        {
            name: "usersWithEmail",
            description: "Active for users defined  in the comma-separated emails-parameter.",
            parametersTemplate: {
                emails: "String"
            }
        }
    ], function (strategy) {
        return request
            .post('/strategies').send(strategy)
            .set('Content-Type', 'application/json')
            .expect(201)
            .endAsync();
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
        }
    ], function (feature) {
        return request
            .post('/features').send(feature)
            .set('Content-Type', 'application/json')
            .expect(201)
            .endAsync();
    });
}

function destroyStrategies() {
    return knex('strategies').delete();
}

function destroyFeatures() {
    return knex('features').delete();
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
        resetAndSetup: function () { return resetDatabase().then(setupDatabase); }
    }
};