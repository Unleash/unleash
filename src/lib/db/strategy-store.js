'use strict';

const NotFoundError = require('../error/notfound-error');

const STRATEGY_COLUMNS = [
    'name',
    'description',
    'parameters',
    'built_in',
    'deprecated',
];
const TABLE = 'strategies';

class StrategyStore {
    constructor(db, getLogger) {
        this.db = db;
        this.logger = getLogger('strategy-store.js');
    }

    async getStrategies() {
        const rows = await this.db
            .select(STRATEGY_COLUMNS)
            .from(TABLE)
            .orderBy('name', 'asc');

        return rows.map(this.rowToStrategy);
    }

    async getEditableStrategies() {
        const rows = await this.db
            .select(STRATEGY_COLUMNS)
            .from(TABLE)
            .where({ built_in: 0 }) // eslint-disable-line
            .orderBy('name', 'asc');
        return rows.map(this.rowToEditableStrategy);
    }

    async getStrategy(name) {
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
            deprecated: row.deprecated,
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
            deprecated: row.deprecated,
        };
    }

    eventDataToRow(data) {
        return {
            name: data.name,
            description: data.description,
            parameters: JSON.stringify(data.parameters),
        };
    }

    async createStrategy(data) {
        this.db(TABLE)
            .insert(this.eventDataToRow(data))
            .catch(err =>
                this.logger.error('Could not insert strategy, error: ', err),
            );
    }

    async updateStrategy(data) {
        this.db(TABLE)
            .where({ name: data.name })
            .update(this.eventDataToRow(data))
            .catch(err =>
                this.logger.error('Could not update strategy, error: ', err),
            );
    }

    async deprecateStrategy({ name }) {
        this.db(TABLE)
            .where({ name })
            .update({ deprecated: true })
            .catch(err =>
                this.logger.error('Could not deprecate strategy, error: ', err),
            );
    }

    async reactivateStrategy({ name }) {
        this.db(TABLE)
            .where({ name })
            .update({ deprecated: false })
            .catch(err =>
                this.logger.error(
                    'Could not reactivate strategy, error: ',
                    err,
                ),
            );
    }

    async deleteStrategy({ name }) {
        return this.db(TABLE)
            .where({ name })
            .del()
            .catch(err => {
                this.logger.error('Could not delete strategy, error: ', err);
            });
    }

    async importStrategy(data) {
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

    async dropStrategies() {
        return this.db(TABLE)
            .where({ built_in: 0 }) // eslint-disable-line
            .delete()
            .catch(err =>
                this.logger.error('Could not drop strategies, error: ', err),
            );
    }
}

module.exports = StrategyStore;
