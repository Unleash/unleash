import type { Db } from '../../db/db.js';
import type {
    Collaborator,
    IFeatureCollaboratorsReadModel,
} from './types/feature-collaborators-read-model-type.js';
import { generateImageUrl } from '../../util/index.js';

export class FeatureCollaboratorsReadModel
    implements IFeatureCollaboratorsReadModel
{
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getFeatureCollaborators(
        feature: string,
    ): Promise<Array<Collaborator>> {
        const query = this.db
            .with('recent_events', (queryBuilder) => {
                queryBuilder
                    .select('created_by_user_id')
                    .max('created_at as max_created_at')
                    .from('events')
                    .where('feature_name', feature)
                    .groupBy('created_by_user_id');
            })
            .select('users.id', 'users.email', 'users.username', 'users.name')
            .from('recent_events')
            .join('users', 'recent_events.created_by_user_id', 'users.id')
            .orderBy('recent_events.max_created_at', 'desc');

        const rows = await query;

        return rows.map((row) => {
            const name = row.name || row.username || row.email || 'unknown';
            return {
                id: row.id,
                name: name,
                imageUrl: generateImageUrl({
                    id: row.id,
                    email: row.email,
                    username: name,
                }),
            };
        });
    }
}
