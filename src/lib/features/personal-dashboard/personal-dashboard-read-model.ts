import type { Db } from '../../db/db';
import type {
    IPersonalDashboardReadModel,
    PersonalFeature,
    PersonalProject,
} from './personal-dashboard-read-model-type';

export class PersonalDashboardReadModel implements IPersonalDashboardReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getPersonalProjects(userId: number): Promise<PersonalProject[]> {
        const result = await this.db<{
            name: string;
            id: string;
            roleId: number;
            roleName: string;
            roleType: string;
        }>('projects')
            .join('role_user', 'projects.id', 'role_user.project')
            .join('roles', 'role_user.role_id', 'roles.id')
            .where('role_user.user_id', userId)
            .whereNull('project.archived_at')
            .select(
                'projects.name',
                'projects.id',
                'roles.id as roleId',
                'roles.name as roleName',
                'roles.type as roleType',
            )
            .orderBy('projects.name', 'desc')
            .limit(100);

        console.log(result);

        return result.reduce((acc, row) => {
            if (acc[row.id]) {
                acc[row.id].roles.push({
                    id: row.roleId,
                    name: row.roleName,
                    type: row.roleType,
                });
            } else {
                acc[row.id] = {
                    id: row.id,
                    name: row.name,
                    roles: [
                        {
                            id: row.roleId,
                            name: row.roleName,
                            type: row.roleType,
                        },
                    ],
                };
            }
            return acc;
        }, {});
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
