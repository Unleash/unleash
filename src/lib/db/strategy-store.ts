import { Logger, LogProvider } from '../logger';

import NotFoundError from '../error/notfound-error';
import {
    IEditableStrategy,
    IMinimalStrategyRow,
    IStrategy,
    IStrategyImport,
    IStrategyStore,
} from '../types/stores/strategy-store';
import { Db } from './db';

const STRATEGY_COLUMNS = [
    'title',
    'name',
    'description',
    'parameters',
    'built_in',
    'deprecated',
    'display_name',
];
const TABLE = 'strategies';

interface IStrategyRow {
    title: string;
    name: string;
    built_in: number;
    description: string;
    parameters: object[];
    deprecated: boolean;
    display_name: string;
}
export default class StrategyStore implements IStrategyStore {
    private db: Db;

    private logger: Logger;

    constructor(db: Db, getLogger: LogProvider) {
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

    async count(): Promise<number> {
        return this.db
            .from(TABLE)
            .count('*')
            .then((res) => Number(res[0].count));
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
            title: row.title,
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
            title: row.title,
        };
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    eventDataToRow(data): IMinimalStrategyRow {
        return {
            name: data.name,
            description: data.description,
            parameters: JSON.stringify(data.parameters),
            title: data.title,
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

    async importStrategy(data: IStrategyImport): Promise<void> {
        const rowData = {
            name: data.name,
            description: data.description,
            deprecated: data.deprecated || false,
            parameters: JSON.stringify(data.parameters || []),
            built_in: data.builtIn ? 1 : 0,
            sort_order: data.sortOrder || 9999,
            display_name: data.displayName,
            title: data.title,
        };
        await this.db(TABLE).insert(rowData).onConflict(['name']).merge();
    }

    async dropCustomStrategies(): Promise<void> {
        await this.db(TABLE)
            .where({ built_in: 0 }) // eslint-disable-line
            .delete();
    }
}

module.exports = StrategyStore;
