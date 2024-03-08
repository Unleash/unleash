import { NotFoundError } from '../../error';
import { DB_TIME } from '../../metric-events';
import { Db, IUnleashConfig } from '../../server-impl';
import { Store } from '../../types/stores/store';
import metricsHelper from '../../util/metrics-helper';
import { defaultFromRow, defaultToRow } from './default-mappings';
import { Row } from './row-type';

export type CrudStoreConfig = Pick<IUnleashConfig, 'eventBus'>;

/**
 * This abstract class defines the basic operations for a CRUD store
 *
 * Provides default types for:
 * - RowReadModel turning the properties of ReadModel from camelCase to snake_case
 * - RowWriteModel turning the properties of WriteModel from camelCase to snake_case
 * - IdType assumming it's a number
 *
 * These types can be overridden to suit different needs.
 *
 * Default implementations of toRow and fromRow are provided, but can be overridden.
 */
export abstract class CRUDStore<
    ReadModel extends { id: IdType },
    WriteModel,
    RowReadModel = Row<ReadModel>,
    RowWriteModel = Row<WriteModel>,
    IdType = number,
> implements Store<ReadModel, IdType>
{
    protected db: Db;

    protected tableName: string;

    protected readonly timer: (action: string) => Function;

    protected toRow: (item: Partial<WriteModel>) => Partial<RowWriteModel>;
    protected fromRow: (item: Partial<RowReadModel>) => Partial<ReadModel>;

    constructor(
        tableName: string,
        db: Db,
        { eventBus }: CrudStoreConfig,
        options?: Partial<{
            toRow: (item: Partial<WriteModel>) => Partial<RowWriteModel>;
            fromRow: (item: RowReadModel) => Partial<ReadModel>;
        }>,
    ) {
        this.tableName = tableName;
        this.db = db;
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: tableName,
                action,
            });
        this.toRow = options?.toRow ?? defaultToRow<WriteModel, RowWriteModel>;
        this.fromRow =
            options?.fromRow ?? defaultFromRow<ReadModel, RowReadModel>;
    }

    async getAll(query?: Partial<WriteModel>): Promise<ReadModel[]> {
        let allQuery = this.db(this.tableName);
        if (query) {
            allQuery = allQuery.where(this.toRow(query) as Record<string, any>);
        }
        const items = await allQuery;
        return items.map(this.fromRow) as ReadModel[];
    }

    async insert(item: WriteModel): Promise<ReadModel> {
        const rows = await this.db(this.tableName)
            .insert(this.toRow(item))
            .returning('*');
        return this.fromRow(rows[0]) as ReadModel;
    }

    async bulkInsert(items: WriteModel[]): Promise<ReadModel[]> {
        if (!items || items.length === 0) {
            return [];
        }
        const rows = await this.db(this.tableName)
            .insert(items.map(this.toRow))
            .returning('*');
        return rows.map(this.fromRow) as ReadModel[];
    }

    async update(id: IdType, item: Partial<WriteModel>): Promise<ReadModel> {
        const rows = await this.db(this.tableName)
            .where({ id })
            .update(this.toRow(item))
            .returning('*');
        return this.fromRow(rows[0]) as ReadModel;
    }

    async delete(id: IdType): Promise<void> {
        return this.db(this.tableName).where({ id }).delete();
    }

    async deleteAll(): Promise<void> {
        return this.db(this.tableName).delete();
    }

    destroy(): void {}

    async exists(id: IdType): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async count(query?: Partial<WriteModel>): Promise<number> {
        let countQuery = this.db(this.tableName).count('*');
        if (query) {
            countQuery = countQuery.where(
                this.toRow(query) as Record<string, any>,
            );
        }
        const { count } = (await countQuery.first()) ?? { count: 0 };
        return Number(count);
    }

    async get(id: IdType): Promise<ReadModel> {
        const row = await this.db(this.tableName).where({ id }).first();
        if (!row) {
            throw new NotFoundError(`No item with id ${id}`);
        }
        return this.fromRow(row) as ReadModel;
    }
}
