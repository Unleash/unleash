var eventStore      = require('./eventStore');
var eventType       = require('./eventType');
var logger          = require('./logger');
var knex            = require('./dbPool');
var STRATEGY_COLUMNS = ['name', 'description', 'parameters_template'];

eventStore.on(eventType.strategyCreated, function (event) {
    knex('strategies')
        .insert(eventToRow(event))
        .catch(function (err) {
            logger.error('Could not insert strategy, error was: ', err);
        });
});

function getStrategies() {
    return knex
        .select(STRATEGY_COLUMNS)
        .from('strategies')
        .orderBy('created_at', 'asc')
        .map(rowToStrategy);
}

function getStrategy(name) {
    return knex
        .first(STRATEGY_COLUMNS)
        .from('strategies')
        .where({name: name})
        .then(rowToStrategy);
}

function rowToStrategy(row) {
    if (!row) {
        throw new Error('invalid row');
    }

    return {
        name: row.name,
        description: row.description,
        enabled: row.enabled > 0,
        parametersTemplate: row.parameters_template // jshint ignore: line
    };
}

function eventToRow(event) {
    return {
        name: event.data.name,
        description: event.data.description,
        parameters_template: event.data.parametersTemplate // jshint ignore: line
    };
}

module.exports = {
    getStrategies: getStrategies,
    getStrategy: getStrategy
};

