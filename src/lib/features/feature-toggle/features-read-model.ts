import type { Db } from '../../db/db.js';
import type { IFeaturesReadModel } from './types/features-read-model-type.js';

export class FeaturesReadModel implements IFeaturesReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async featureExists(name: string): Promise<boolean> {
        const rows = await this.db('features')
            .where('name', name)
            .andWhere('archived_at', null)
            .select('name');

        return rows.length > 0;
    }

    async featureExistsInProject(
        featureName: string,
        projectId: string,
    ): Promise<boolean> {
        const rows = await this.db('features')
            .where('name', featureName)
            .andWhere('project', projectId)
            .andWhere('archived_at', null)
            .select('name');

        return rows.length > 0;
    }

    async featuresInTheSameProject(
        featureA: string,
        featureB: string,
    ): Promise<boolean> {
        const rows = await this.db('features')
            .countDistinct('project as count')
            .whereIn('name', [featureA, featureB]);
        return Number(rows[0].count) === 1;
    }
}
