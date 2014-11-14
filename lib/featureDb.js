var eventStore      = require('./eventStore');
var eventType       = require('./eventType');
var logger          = require('./logger');
var knex            = require('./dbPool');
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
        .orderBy('created_at', 'desc')
        .then(function (rows) {
            return rows.map(rowToFeature);
        });
}

function getFeature(name) {
    return knex
        .select(FEATURE_COLUMNS)
        .from('features')
        .where({name: name})
        .limit(1)
        .then(function (rows) {
            if (rows.length) {
                return rowToFeature(rows[0]);
            } else {
                throw new Error('could not find feature named: ' + name);
            }
        });
}

function rowToFeature(row) {
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

module.exports = {
    getFeatures: getFeatures,
    getFeature: getFeature
};

