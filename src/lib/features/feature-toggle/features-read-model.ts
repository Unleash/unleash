import type { Db } from '../../db/db.js';
import type { IFeaturesReadModel } from './types/features-read-model-type.js';

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

    async featuresInTheSameProject(
        featureA: string,
        featureB: string,
        project: string,
    ): Promise<boolean> {
        const rows = await this.db('feature_project')
            .whereIn('feature_name', [featureA, featureB])
            .andWhere('project_id', project)
            .countDistinct('feature_name as count');

        return Number(rows[0].count) === 2;
    }
}
