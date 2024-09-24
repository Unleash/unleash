import type { Db } from '../../db/db';
import type {
    IPersonalDashboardReadModel,
    PersonalFeature,
} from './personal-dashboard-read-model-type';

export class PersonalDashboardReadModel implements IPersonalDashboardReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getPersonalFeatures(userId: number): Promise<PersonalFeature[]> {
        const result = await this.db<{
            name: string;
            type: string;
            project: string;
        }>('favorite_features')
            .join('features', 'favorite_features.feature', 'features.name')
            .where('favorite_features.user_id', userId)
            .whereNull('features.archived_at')
            .select(
                'features.name as name',
                'features.type',
                'features.project',
                'features.created_at',
            )
            .union(function () {
                this.select('name', 'type', 'project', 'created_at')
                    .from('features')
                    .where('features.created_by_user_id', userId)
                    .whereNull('features.archived_at');
            })
            .orderBy('created_at', 'desc')
            .limit(100);

        return result.map((row) => ({
            name: row.name,
            type: row.type,
            project: row.project,
        }));
    }
}
