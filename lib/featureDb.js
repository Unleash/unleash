var eventStore      = require('./eventStore');
var eventType       = require('./eventType');
var logger          = require('./logger');
var knex            = require('./dbPool');
var Promise         = require("bluebird");
var NotFoundError   = require('./error/NotFoundError');
var NameExistsError = require('./error/NameExistsError');
var FEATURE_COLUMNS = ['name', 'description', 'enabled', 'strategy_name', 'parameters'];

eventStore.on(eventType.featureCreated, function (event) {
    knex('features')
        .insert(eventToRow(event))
        .catch(function (err) {
            logger.error('Could not insert feature, error was: ', err);
        });
});

eventStore.on(eventType.featureUpdated, function (event) {
    knex('features')
        .where({name: event.data.name})
        .update(eventToRow(event))
        .catch(function (err) {
            logger.error('Could not update feature, error was: ', err);
        });
});

function getFeatures() {
    return knex
        .select(FEATURE_COLUMNS)
        .from('features')
        .orderBy('name', 'asc')
        .map(rowToFeature);
}

function getFeature(name) {
    return knex
        .first(FEATURE_COLUMNS)
        .from('features')
        .where({name: name})
        .then(rowToFeature);
}

function rowToFeature(row) {
    if (!row) {
        throw new NotFoundError('No feature toggle found');
    }

    return {
        name: row.name,
        description: row.description,
        enabled: row.enabled > 0,
        strategy: row.strategy_name, // jshint ignore: line
        parameters: row.parameters
    };
}

function eventToRow(event) {
    return {
        name: event.data.name,
        description: event.data.description,
        enabled: event.data.enabled ? 1 : 0,
        strategy_name: event.data.strategy, // jshint ignore: line
        parameters: event.data.parameters
    };
}

function validateUniqueName(req) {
    return new Promise(function(resolve, reject) {
        getFeature(req.body.name)
            .then(function() {
                reject(new NameExistsError("Feature name already exist"));
            }, function() {
                resolve(req);
            });
    });
}

module.exports = {
    getFeatures: getFeatures,
    getFeature: getFeature,
    validateUniqueName: validateUniqueName
};

