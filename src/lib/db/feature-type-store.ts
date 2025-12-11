import type { LogProvider } from '../logger.js';
import type {
    IFeatureType,
    IFeatureTypeStore,
} from '../types/stores/feature-type-store.js';
import type { Db } from './db.js';

const COLUMNS = ['id', 'name', 'description', 'lifetime_days'];
const TABLE = 'feature_types';

interface IFeatureTypeRow {
    id: string;
    name: string;
    description: string;
    lifetime_days: number;
}

class FeatureTypeStore implements IFeatureTypeStore {
    private db: Db;

    constructor(db: Db, _getLogger: LogProvider) {
        this.db = db;
    }

    async getAll(): Promise<IFeatureType[]> {
        const rows = await this.db.select(COLUMNS).from(TABLE);
        return rows.map(this.rowToFeatureType);
    }

    private rowToFeatureType(row: IFeatureTypeRow): IFeatureType {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            lifetimeDays: row.lifetime_days,
        };
    }

    async get(id: string): Promise<IFeatureType> {
        const row = await this.db(TABLE).where({ id }).first();
        return row ? this.rowToFeatureType(row) : row;
    }

    async getByName(name: string): Promise<IFeatureType> {
        const row = await this.db(TABLE).where({ name }).first();
        return this.rowToFeatureType(row);
    }

    async delete(key: string): Promise<void> {
        await this.db(TABLE).where({ id: key }).del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [key],
        );
        const { present } = result.rows[0];
        return present;
    }

    async updateLifetime(
        id: string,
        newLifetimeDays: number | null,
    ): Promise<IFeatureType | undefined> {
        const [updatedType] = await this.db(TABLE)
            .update({ lifetime_days: newLifetimeDays })
            .where({ id })
            .returning(['*']);

        if (updatedType) {
            return this.rowToFeatureType(updatedType);
        } else {
            return undefined;
        }
    }
}
export default FeatureTypeStore;
