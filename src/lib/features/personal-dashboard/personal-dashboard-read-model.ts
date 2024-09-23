import type { Db } from '../../db/db';
import type { IPersonalDashboardReadModel } from './personal-dashboard-read-model-type';

export class PersonalDashboardReadModel implements IPersonalDashboardReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    getPersonalFeatures(userId: number): Promise<{ name: string }[]> {
        return this.db<{ name: string }>('favorite_features')
            .where('favorite_features.user_id', userId)
            .select('feature as name')
            .union(function () {
                this.select('name')
                    .from('features')
                    .where('features.created_by_user_id', userId);
            })
            .orderBy('name', 'asc');
    }
}
