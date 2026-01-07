import type { Db } from '../../db/db.js';
import type {
    BasePersonalProject,
    IPersonalDashboardReadModel,
    PersonalFeature,
    PersonalProject,
} from './personal-dashboard-read-model-type.js';

type IntermediateProjectResult = Omit<PersonalProject, 'roles'> & {
    roles: {
        [id: number]: { id: number; name: string; type: string };
    };
};

export class PersonalDashboardReadModel implements IPersonalDashboardReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getLatestHealthScores(
        project: string,
        count: number,
    ): Promise<number[]> {
        const results = await this.db<{ health: number }>('flag_trends')
            .select('health')
            .orderBy('created_at', 'desc')
            .where('project', project)
            .limit(count);

        return results.map((row) => Number(row.health));
    }

    async getPersonalProjects(userId: number): Promise<BasePersonalProject[]> {
        const result = await this.db<{
            name: string;
            id: string;
            roleId: number;
            roleName: string;
            roleType: string;
        }>('projects')
            .join('role_user', 'projects.id', 'role_user.project')
            .join('roles', 'role_user.role_id', 'roles.id')
            .leftJoin('group_user', (join) => {
                join.on('group_user.user_id', '=', this.db.raw('?', [userId]));
            })
            .leftJoin(
                'group_role',
                'group_role.group_id',
                'group_user.group_id',
            )
            .leftJoin(
                'roles as group_roles',
                'group_role.role_id',
                'group_roles.id',
            )
            .where('role_user.user_id', userId)
            .orWhere('group_user.user_id', userId)
            .whereNull('projects.archived_at')
            .select(
                'projects.name',
                'projects.id',
                'roles.id as roleId',
                'roles.name as roleName',
                'roles.type as roleType',
            )
            .limit(100);

        const dict = result.reduce((acc, row) => {
            if (acc[row.id]) {
                acc[row.id].roles[row.roleId] = {
                    id: row.roleId,
                    name: row.roleName,
                    type: row.roleType,
                };
            } else {
                acc[row.id] = {
                    id: row.id,
                    name: row.name,
                    roles: {
                        [row.roleId]: {
                            id: row.roleId,
                            name: row.roleName,
                            type: row.roleType,
                        },
                    },
                };
            }
            return acc;
        }, {});

        const projectList: PersonalProject[] = Object.values(dict).map(
            (project: IntermediateProjectResult) => {
                const roles = Object.values(project.roles);
                roles.sort((a, b) => a.id - b.id);
                return {
                    ...project,
                    roles,
                } as PersonalProject;
            },
        );
        projectList.sort((a, b) => a.name.localeCompare(b.name));
        return projectList;
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
