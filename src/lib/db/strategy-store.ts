'use strict';

import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';

const NotFoundError = require('../error/notfound-error');

const STRATEGY_COLUMNS = [
    'name',
    'description',
    'parameters',
    'built_in',
    'deprecated',
];
const TABLE = 'strategies';

export interface IStrategy {
    name: string;
    editable: boolean;
    description: string;
    parameters: object;
    deprecated: boolean;
}

export interface IEditableStrategy {
    name: string;
    description: string;
    parameters: object;
    deprecated: boolean;
}

export interface IMinimalStrategy {
    name: string;
    description: string;
    parameters: string;
}

export interface IStrategyName {
    name: string;
}

interface IStrategyRow {
    name: string;
    built_in: number;
    description: string;
    parameters: object;
    deprecated: boolean;
}
export default class StrategyStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('strategy-store.js');
    }

    async getStrategies(): Promise<IStrategy[]> {
        const rows = await this.db
            .select(STRATEGY_COLUMNS)
            .from(TABLE)
            .orderBy('sort_order', 'asc')
            .orderBy('name', 'asc');

        return rows.map(this.rowToStrategy);
    }

    async getEditableStrategies(): Promise<IEditableStrategy[]> {
        const rows = await this.db
            .select(STRATEGY_COLUMNS)
            .from(TABLE)
            .where({ built_in: 0 }) // eslint-disable-line
            .orderBy('sort_order', 'asc')
            .orderBy('name', 'asc');

        return rows.map(this.rowToEditableStrategy);
    }

    async getStrategy(name: string): Promise<IStrategy> {
        return this.db
            .first(STRATEGY_COLUMNS)
            .from(TABLE)
            .where({ name })
            .then(this.rowToStrategy);
    }

    rowToStrategy(row: IStrategyRow): IStrategy {
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

    rowToEditableStrategy(row: IStrategyRow): IEditableStrategy {
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

    eventDataToRow(data): IMinimalStrategy {
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

    async updateStrategy(data): Promise<void> {
        this.db(TABLE)
            .where({ name: data.name })
            .update(this.eventDataToRow(data))
            .catch(err =>
                this.logger.error('Could not update strategy, error: ', err),
            );
    }

    async deprecateStrategy({ name }: IStrategyName): Promise<void> {
        this.db(TABLE)
            .where({ name })
            .update({ deprecated: true })
            .catch(err =>
                this.logger.error('Could not deprecate strategy, error: ', err),
            );
    }

    async reactivateStrategy({ name }: IStrategyName) {
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

    async deleteStrategy({ name }: IStrategyName) {
        return this.db(TABLE)
            .where({ name })
            .del()
            .catch(err => {
                this.logger.error('Could not delete strategy, error: ', err);
            });
    }

    async importStrategy(data) {
        const rowData = this.eventDataToRow(data);
        await this.db(TABLE)
            .insert(rowData)
            .onConflict(['name'])
            .merge();
    }

    async dropStrategies(): Promise<void> {
        await this.db(TABLE)
            .where({ built_in: 0 }) // eslint-disable-line
            .delete()
            .catch(err =>
                this.logger.error('Could not drop strategies, error: ', err),
            );
    }
}

module.exports = StrategyStore;
