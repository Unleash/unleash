'use strict';

import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';

const COLUMNS = ['id', 'name', 'description', 'lifetime_days'];
const TABLE = 'feature_types';

export interface IFeatureType {
    id: number;
    name: string;
    description: string;
    lifetimeDays: number;
}

interface IFeatureTypeRow {
    id: number;
    name: string;
    description: string;
    lifetime_days: number;
}

class FeatureTypeStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('feature-type-store.js');
    }

    async getAll(): Promise<IFeatureType[]> {
        const rows = await this.db.select(COLUMNS).from(TABLE);
        return rows.map(this.rowToFeatureType);
    }

    rowToFeatureType(row: IFeatureTypeRow): IFeatureType {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            lifetimeDays: row.lifetime_days,
        };
    }
}
export default FeatureTypeStore;
module.exports = FeatureTypeStore;
