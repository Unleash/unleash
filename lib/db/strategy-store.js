'use strict';

const {
    STRATEGY_CREATED,
    STRATEGY_DELETED,
    STRATEGY_UPDATED,
} = require('../event-type');
const logger = require('../logger');
const NotFoundError = require('../error/notfound-error');
const STRATEGY_COLUMNS = ['name', 'description', 'parameters'];
const TABLE = 'strategies';

class StrategyStore {
    constructor(db, eventStore) {
        this.db = db;
        eventStore.on(STRATEGY_CREATED, event =>
            this._createStrategy(event.data)
        );
        eventStore.on(STRATEGY_UPDATED, event =>
            this._updateStrategy(event.data)
        );
        eventStore.on(STRATEGY_DELETED, event => {
            db(TABLE).where('name', event.data.name).del().catch(err => {
                logger.error('Could not delete strategy, error was: ', err);
            });
        });
    }

    getStrategies() {
        return this.db
            .select(STRATEGY_COLUMNS)
            .from(TABLE)
            .orderBy('name', 'asc')
            .map(this.rowToStrategy);
    }

    getStrategy(name) {
        return this.db
            .first(STRATEGY_COLUMNS)
            .from(TABLE)
            .where({ name })
            .then(this.rowToStrategy);
    }

    rowToStrategy(row) {
        if (!row) {
            throw new NotFoundError('No strategy found');
        }

        return {
            name: row.name,
            description: row.description,
            parameters: row.parameters,
        };
    }

    eventDataToRow(data) {
        return {
            name: data.name,
            description: data.description,
            parameters: JSON.stringify(data.parameters),
        };
    }

    _createStrategy(data) {
        this.db(TABLE)
            .insert(this.eventDataToRow(data))
            .catch(err =>
                logger.error('Could not insert strategy, error was: ', err)
            );
    }

    _updateStrategy(data) {
        this.db(TABLE)
            .where({ name: data.name })
            .update(this.eventDataToRow(data))
            .catch(err =>
                logger.error('Could not update strategy, error was: ', err)
            );
    }
}

module.exports = StrategyStore;
