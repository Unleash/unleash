'use strict';

const eventType = require('../event-type');
const logger = require('../logger');
const NotFoundError = require('../error/notfound-error');
const STRATEGY_COLUMNS = ['name', 'description', 'parameters_template'];
const TABLE = 'strategies';

class StrategyStore {
    constructor (db, eventStore) {
        this.db = db;
        eventStore.on(eventType.strategyCreated, event => this._createStrategy(event.data));
        eventStore.on(eventType.strategyDeleted, event => {
            db(TABLE)
                .where('name', event.data.name)
                .del()
                .catch(err => {
                    logger.error('Could not delete strategy, error was: ', err);
                });
        });
    }

    getStrategies () {
        return this.db
            .select(STRATEGY_COLUMNS)
            .from(TABLE)
            .orderBy('created_at', 'asc')
            .map(this.rowToStrategy);
    }

    getStrategy (name) {
        return this.db
            .first(STRATEGY_COLUMNS)
            .from(TABLE)
            .where({ name })
            .then(this.rowToStrategy);
    }

    rowToStrategy (row) {
        if (!row) {
            throw new NotFoundError('No strategy found');
        }

        return {
            name: row.name,
            description: row.description,
            parametersTemplate: row.parameters_template,
        };
    }

    eventDataToRow (data) {
        return {
            name: data.name,
            description: data.description,
            parameters_template: data.parametersTemplate // eslint-disable-line
        };
    }

    _createStrategy (data) {
        this.db(TABLE)
            .insert(this.eventDataToRow(data))
            .catch(err => logger.error('Could not insert strategy, error was: ', err));
    }
};

module.exports = StrategyStore;

