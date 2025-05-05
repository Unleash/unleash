import { NotFoundError } from '../../error/index.js';
import { DB_TIME } from '../../metric-events.js';
import type { Store } from '../../types/stores/store.js';
import metricsHelper from '../../util/metrics-helper.js';
import { defaultFromRow, defaultToRow } from './default-mappings.js';
import type { Row } from './row-type.js';
import type { IUnleashConfig } from '../../types/index.js';
import type { Db } from '../db.js';

export type CrudStoreConfig = Pick<IUnleashConfig, 'eventBus'>;

/**
 * This abstract class defines the basic operations for a CRUD store.
 *
 * It accepts one model as input and one model as output that generally includes auto-generated properties such as the id or createdAt.
 *
 * Provides default types for:
 * - OutputRowModel turning the properties of OutputModel from camelCase to snake_case
 * - InputRowModel turning the properties of InputModel from camelCase to snake_case
 * - IdType assumming it's a number
 *
 * These types can be overridden to suit different needs.
 *
 * Default implementations of toRow and fromRow are provided, but can be overridden.
 */
export abstract class CRUDStore<
    OutputModel extends { id: IdType },
    InputModel,
    OutputRowModel = Row<OutputModel>,
    InputRowModel = Row<InputModel>,
    IdType = number,
> implements Store<OutputModel, IdType>
{
    protected db: Db;

    protected tableName: string;

    protected readonly timer: (action: string) => Function;

    protected toRow: (item: Partial<InputModel>) => Partial<InputRowModel>;
    protected fromRow: (item: Partial<OutputRowModel>) => Partial<OutputModel>;

    constructor(
        tableName: string,
        db: Db,
        { eventBus }: CrudStoreConfig,
        options?: Partial<{
            toRow: (item: Partial<InputModel>) => Partial<InputRowModel>;
            fromRow: (item: OutputRowModel) => Partial<OutputModel>;
        }>,
    ) {
        this.tableName = tableName;
        this.db = db;
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: tableName,
                action,
            });
        this.toRow = options?.toRow ?? defaultToRow<InputModel, InputRowModel>;
        this.fromRow =
            options?.fromRow ?? defaultFromRow<OutputModel, OutputRowModel>;
    }

    async getAll(query?: Partial<InputModel>): Promise<OutputModel[]> {
        const endTimer = this.timer('getAll');
        let allQuery = this.db(this.tableName);
        if (query) {
            allQuery = allQuery.where(this.toRow(query) as Record<string, any>);
        }
        const items = await allQuery;
        endTimer();
        return items.map(this.fromRow) as OutputModel[];
    }

    async insert(item: InputModel): Promise<OutputModel> {
        const rows = await this.db(this.tableName)
            .insert(this.toRow(item))
            .returning('*');
        return this.fromRow(rows[0]) as OutputModel;
    }

    async bulkInsert(items: InputModel[]): Promise<OutputModel[]> {
        if (!items || items.length === 0) {
            return [];
        }
        const endTimer = this.timer('bulkInsert');
        const rows = await this.db(this.tableName)
            .insert(items.map(this.toRow))
            .returning('*');
        endTimer();
        return rows.map(this.fromRow) as OutputModel[];
    }

    async update(id: IdType, item: Partial<InputModel>): Promise<OutputModel> {
        const rows = await this.db(this.tableName)
            .where({ id })
            .update(this.toRow(item))
            .returning('*');
        return this.fromRow(rows[0]) as OutputModel;
    }

    async delete(id: IdType): Promise<void> {
        return this.db(this.tableName).where({ id }).delete();
    }

    async deleteAll(): Promise<void> {
        return this.db(this.tableName).delete();
    }

    destroy(): void {}

    async exists(id: IdType): Promise<boolean> {
        const endTimer = this.timer('exists');
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        endTimer();
        return present;
    }

    async count(query?: Partial<InputModel>): Promise<number> {
        const endTimer = this.timer('count');
        let countQuery = this.db(this.tableName).count('*');
        if (query) {
            countQuery = countQuery.where(
                this.toRow(query) as Record<string, any>,
            );
        }
        const { count } = (await countQuery.first()) ?? { count: 0 };
        endTimer();
        return Number(count);
    }

    async get(id: IdType): Promise<OutputModel> {
        const endTimer = this.timer('get');
        const row = await this.db(this.tableName).where({ id }).first();
        endTimer();
        if (!row) {
            throw new NotFoundError(`No item with id ${id}`);
        }
        return this.fromRow(row) as OutputModel;
    }
}
