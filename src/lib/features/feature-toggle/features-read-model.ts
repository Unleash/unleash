import { Db } from '../../db/db';
import { IFeaturesReadModel } from './features-read-model-type';

export class FeaturesReadModel implements IFeaturesReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async featureExists(parent: string): Promise<boolean> {
        const rows = await this.db('features')
            .where('name', parent)
            .andWhere('archived_at', null)
            .select('name');

        return rows.length > 0;
    }
}
