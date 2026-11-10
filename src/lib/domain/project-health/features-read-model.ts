import type { Db } from '../../db/db.js';

export interface IProjectHealthFeaturesReadModel {
    /**
     * Reads the potentially_stale column, which the scheduled
     * updatePotentiallyStaleFeatures job refreshes every minute.
     * So the count can lag by up to a minute.
     */
    getPotentiallyStaleCount(projectId: string): Promise<number>;
}

export class ProjectHealthFeaturesReadModel
    implements IProjectHealthFeaturesReadModel
{
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getPotentiallyStaleCount(projectId: string): Promise<number> {
        const result = await this.db('features')
            .where('project', projectId)
            .andWhere('potentially_stale', true)
            .andWhere('stale', false)
            .whereNull('archived_at')
            .count();
        return Number(result[0].count);
    }
}
