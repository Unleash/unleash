'use strict';

const eventType = require('../eventType');
const logger = require('../logger');
const NotFoundError = require('../error/NotFoundError');
const STRATEGY_COLUMNS = ['name', 'description', 'parameters_template'];

module.exports = function (db, eventStore) {
    eventStore.on(eventType.strategyCreated, event => createStrategy(event.data));

    eventStore.on(eventType.strategyDeleted, event => {
        db('strategies')
            .where('name', event.data.name)
            .del()
            .catch(err => {
                logger.error('Could not delete strategy, error was: ', err);
            });
    });

    function getStrategies () {
        return db
            .select(STRATEGY_COLUMNS)
            .from('strategies')
            .orderBy('created_at', 'asc')
            .map(rowToStrategy);
    }

    function getStrategy (name) {
        return db
            .first(STRATEGY_COLUMNS)
            .from('strategies')
            .where({ name })
            .then(rowToStrategy);
    }

    function rowToStrategy (row) {
        if (!row) {
            throw new NotFoundError('No strategy found');
        }

        return {
            name: row.name,
            description: row.description,
            parametersTemplate: row.parameters_template,
        };
    }

    function eventDataToRow (data) {
        return {
            name: data.name,
            description: data.description,
            parameters_template: data.parametersTemplate // eslint-disable-line
        };
    }

    function createStrategy (data) {
        db('strategies')
            .insert(eventDataToRow(data))
            .catch(err => {
                logger.error('Could not insert strategy, error was: ', err);
            });
    }

    return {
        getStrategies,
        getStrategy,
        _createStrategy: createStrategy, // visible for testing
    };
};

