'use strict';

const {
    STRATEGY_CREATED,
    STRATEGY_DELETED,
    STRATEGY_UPDATED,
    STRATEGY_IMPORT,
    DROP_STRATEGIES,
} = require('../event-type');
const NotFoundError = require('../error/notfound-error');

const STRATEGY_COLUMNS = ['name', 'description', 'parameters', 'built_in'];
const TABLE = 'strategies';

class StrategyStore {
    constructor(db, eventStore, getLogger) {
        this.db = db;
        this.logger = getLogger('strategy-store.js');
        eventStore.on(STRATEGY_CREATED, event =>
            this._createStrategy(event.data),
        );
        eventStore.on(STRATEGY_UPDATED, event =>
            this._updateStrategy(event.data),
        );
        eventStore.on(STRATEGY_DELETED, event =>
            this._deleteStrategy(event.data),
        );
        eventStore.on(STRATEGY_IMPORT, event =>
            this._importStrategy(event.data),
        );
        eventStore.on(DROP_STRATEGIES, () => this._dropStrategies());
    }

    getStrategies() {
        return this.db
            .select(STRATEGY_COLUMNS)
            .from(TABLE)
            .orderBy('name', 'asc')
            .map(this.rowToStrategy);
    }

    getEditableStrategies() {
        return this.db
            .select(STRATEGY_COLUMNS)
            .from(TABLE)
            .where({ built_in: 0 }) // eslint-disable-line
            .orderBy('name', 'asc')
            .map(this.rowToEditableStrategy);
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
            editable: row.built_in !== 1,
            description: row.description,
            parameters: row.parameters,
        };
    }

    rowToEditableStrategy(row) {
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
                this.logger.error('Could not insert strategy, error: ', err),
            );
    }

    _updateStrategy(data) {
        this.db(TABLE)
            .where({ name: data.name })
            .update(this.eventDataToRow(data))
            .catch(err =>
                this.logger.error('Could not update strategy, error: ', err),
            );
    }

    _deleteStrategy({ name }) {
        return this.db(TABLE)
            .where({ name })
            .del()
            .catch(err => {
                this.logger.error('Could not delete strategy, error: ', err);
            });
    }

    _importStrategy(data) {
        const rowData = this.eventDataToRow(data);
        return this.db(TABLE)
            .where({ name: rowData.name, built_in: 0 }) // eslint-disable-line
            .update(rowData)
            .then(result =>
                result === 0 ? this.db(TABLE).insert(rowData) : result,
            )
            .catch(err =>
                this.logger.error('Could not import strategy, error: ', err),
            );
    }

    _dropStrategies() {
        return this.db(TABLE)
            .where({ built_in: 0 }) // eslint-disable-line
            .delete()
            .catch(err =>
                this.logger.error('Could not drop strategies, error: ', err),
            );
    }
}

module.exports = StrategyStore;
