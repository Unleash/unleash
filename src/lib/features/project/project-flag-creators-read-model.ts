import type { Db } from '../../db/db.js';
import type { IProjectFlagCreatorsReadModel } from './project-flag-creators-read-model.type.js';

export class ProjectFlagCreatorsReadModel
    implements IProjectFlagCreatorsReadModel
{
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getFlagCreators(
        project: string,
    ): Promise<Array<{ id: number; name: string }>> {
        const result = await this.db('users')
            .distinct('users.id')
            .join('features', 'users.id', '=', 'features.created_by_user_id')
            .where('features.project', project)
            .where('features.archived_at', null)
            .select([
                'users.id',
                'users.name',
                'users.username',
                'users.email',
            ]);
        return result
            .filter((row) => row.name || row.username || row.email)
            .map((row) => ({
                id: Number(row.id),
                name: String(row.name || row.username || row.email),
            }));
    }
}
