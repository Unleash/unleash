import { NotFoundError } from '../../error';
import { DB_TIME } from '../../metric-events';
import { Db, IUnleashConfig } from '../../server-impl';
import { Store } from '../../types/stores/store';
import metricsHelper from '../../util/metrics-helper';
import { defaultFromRow, defaultToRow } from './default-mappings';
import { Row } from './row-type';

export type CrudStoreConfig = Pick<IUnleashConfig, 'eventBus'>;

/**
 * This abstract class defines the basic operations for a CRUD store.
 *
 * It accepts one model as input and one model as output that generally includes auto-generated properties such as the id or createdAt.
 *
 * Provides default types for:
 * - RowModelOutput turning the properties of ModelOutput from camelCase to snake_case
 * - RowModelInput turning the properties of ModelInput from camelCase to snake_case
 * - IdType assumming it's a number
 *
 * These types can be overridden to suit different needs.
 *
 * Default implementations of toRow and fromRow are provided, but can be overridden.
 */
export abstract class CRUDStore<
    ModelOutput extends { id: IdType },
    ModelInput,
    RowModelOutput = Row<ModelOutput>,
    RowModelInput = Row<ModelInput>,
    IdType = number,
> implements Store<ModelOutput, IdType>
{
    protected db: Db;

    protected tableName: string;

    protected readonly timer: (action: string) => Function;

    protected toRow: (item: Partial<ModelInput>) => Partial<RowModelInput>;
    protected fromRow: (item: Partial<RowModelOutput>) => Partial<ModelOutput>;

    constructor(
        tableName: string,
        db: Db,
        { eventBus }: CrudStoreConfig,
        options?: Partial<{
            toRow: (item: Partial<ModelInput>) => Partial<RowModelInput>;
            fromRow: (item: RowModelOutput) => Partial<ModelOutput>;
        }>,
    ) {
        this.tableName = tableName;
        this.db = db;
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: tableName,
                action,
            });
        this.toRow = options?.toRow ?? defaultToRow<ModelInput, RowModelInput>;
        this.fromRow =
            options?.fromRow ?? defaultFromRow<ModelOutput, RowModelOutput>;
    }

    async getAll(query?: Partial<ModelInput>): Promise<ModelOutput[]> {
        let allQuery = this.db(this.tableName);
        if (query) {
            allQuery = allQuery.where(this.toRow(query) as Record<string, any>);
        }
        const items = await allQuery;
        return items.map(this.fromRow) as ModelOutput[];
    }

    async insert(item: ModelInput): Promise<ModelOutput> {
        const rows = await this.db(this.tableName)
            .insert(this.toRow(item))
            .returning('*');
        return this.fromRow(rows[0]) as ModelOutput;
    }

    async bulkInsert(items: ModelInput[]): Promise<ModelOutput[]> {
        if (!items || items.length === 0) {
            return [];
        }
        const rows = await this.db(this.tableName)
            .insert(items.map(this.toRow))
            .returning('*');
        return rows.map(this.fromRow) as ModelOutput[];
    }

    async update(id: IdType, item: Partial<ModelInput>): Promise<ModelOutput> {
        const rows = await this.db(this.tableName)
            .where({ id })
            .update(this.toRow(item))
            .returning('*');
        return this.fromRow(rows[0]) as ModelOutput;
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

    async count(query?: Partial<ModelInput>): Promise<number> {
        let countQuery = this.db(this.tableName).count('*');
        if (query) {
            countQuery = countQuery.where(
                this.toRow(query) as Record<string, any>,
            );
        }
        const { count } = (await countQuery.first()) ?? { count: 0 };
        return Number(count);
    }

    async get(id: IdType): Promise<ModelOutput> {
        const row = await this.db(this.tableName).where({ id }).first();
        if (!row) {
            throw new NotFoundError(`No item with id ${id}`);
        }
        return this.fromRow(row) as ModelOutput;
    }
}
