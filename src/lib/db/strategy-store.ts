import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';

import NotFoundError from '../error/notfound-error';
import {
    IEditableStrategy,
    IMinimalStrategyRow,
    IStrategy,
    IStrategyStore,
} from '../types/stores/strategy-store';

const STRATEGY_COLUMNS = [
    'name',
    'description',
    'parameters',
    'built_in',
    'deprecated',
    'display_name',
];
const TABLE = 'strategies';

interface IStrategyRow {
    name: string;
    built_in: number;
    description: string;
    parameters: object[];
    deprecated: boolean;
    display_name: string;
}
export default class StrategyStore implements IStrategyStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('strategy-store.ts');
    }

    async getAll(): Promise<IStrategy[]> {
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

    async delete(name: string): Promise<void> {
        await this.db(TABLE).where({ name }).del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async exists(name: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE name = ?) AS present`,
            [name],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(name: string): Promise<IStrategy> {
        const row = await this.db(TABLE).where({ name }).first();
        return this.rowToStrategy(row);
    }

    rowToStrategy(row: IStrategyRow): IStrategy {
        if (!row) {
            throw new NotFoundError('No strategy found');
        }
        return {
            displayName: row.display_name,
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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    eventDataToRow(data): IMinimalStrategyRow {
        return {
            name: data.name,
            description: data.description,
            parameters: JSON.stringify(data.parameters),
        };
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async createStrategy(data): Promise<void> {
        await this.db(TABLE).insert(this.eventDataToRow(data));
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async updateStrategy(data): Promise<void> {
        await this.db(TABLE)
            .where({ name: data.name })
            .update(this.eventDataToRow(data));
    }

    async deprecateStrategy({ name }: Pick<IStrategy, 'name'>): Promise<void> {
        await this.db(TABLE).where({ name }).update({ deprecated: true });
    }

    async reactivateStrategy({ name }: Pick<IStrategy, 'name'>): Promise<void> {
        await this.db(TABLE).where({ name }).update({ deprecated: false });
    }

    async deleteStrategy({ name }: Pick<IStrategy, 'name'>): Promise<void> {
        await this.db(TABLE).where({ name }).del();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async importStrategy(data): Promise<void> {
        const rowData = this.eventDataToRow(data);
        await this.db(TABLE).insert(rowData).onConflict(['name']).merge();
    }

    async dropCustomStrategies(): Promise<void> {
        await this.db(TABLE)
            .where({ built_in: 0 }) // eslint-disable-line
            .delete();
    }
}

module.exports = StrategyStore;
