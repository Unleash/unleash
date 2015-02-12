var eventStore      = require('./eventStore');
var eventType       = require('./eventType');
var logger          = require('./logger');
var knex            = require('./dbPool');
var NotFoundError   = require('./error/NotFoundError');
var STRATEGY_COLUMNS = ['name', 'description', 'parameters_template'];

eventStore.on(eventType.strategyCreated, function (event) {
    return createStrategy(event.data);
});

eventStore.on(eventType.strategyDeleted, function (event) {
    knex('strategies')
        .where('name', event.data.name)
        .del()
        .catch(function (err) {
            logger.error('Could not delete strategy, error was: ', err);
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
        throw new NotFoundError('No strategy found');
    }

    return {
        name: row.name,
        description: row.description,
        parametersTemplate: row.parameters_template // jshint ignore: line
    };
}

function eventDataToRow(data) {
    return {
        name: data.name,
        description: data.description,
        parameters_template: data.parametersTemplate // jshint ignore: line
    };
}

function createStrategy(data) {
    knex('strategies')
        .insert(eventDataToRow(data))
        .catch(function (err) {
            logger.error('Could not insert strategy, error was: ', err);
        });
}

module.exports = {
    getStrategies: getStrategies,
    getStrategy: getStrategy,
    _createStrategy: createStrategy // visible for testing
};

