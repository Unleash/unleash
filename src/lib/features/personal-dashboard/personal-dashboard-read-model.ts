import type { Db } from '../../db/db';
import type {
    IPersonalDashboardReadModel,
    PersonalFeature,
    PersonalProject,
} from './personal-dashboard-read-model-type';

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
            .join('group_user', (join) => {
                join.on('group_user.user_id', '=', this.db.raw('?', [userId]));
            })
            .join('group_role', 'group_role.group_id', 'group_user.group_id')
            .join(
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

    async enrichProjectIds(
        userId: number,
        projectIds: string[],
    ): Promise<PersonalProject[]> {
        const T = {
            ROLE_USER: 'role_user',
            ROLES: 'roles',
            GROUPS: 'groups',
            GROUP_ROLE: 'group_role',
            GROUP_USER: 'group_user',
            ROLE_PERMISSION: 'role_permission',
            PERMISSIONS: 'permissions',
            PERMISSION_TYPES: 'permission_types',
            CHANGE_REQUEST_SETTINGS: 'change_request_settings',
            PERSONAL_ACCESS_TOKENS: 'personal_access_tokens',
            PUBLIC_SIGNUP_TOKENS_USER: 'public_signup_tokens_user',
        };

        const roles = await this.db
            .select(['id', 'name', 'type', 'project', 'description'])
            .from(T.ROLES)
            .innerJoin(`${T.ROLE_USER} as ru`, 'ru.role_id', 'id')
            .where('ru.user_id', '=', userId)
            .andWhere((builder) => {
                builder
                    .whereIn('ru.project', projectIds)
                    .orWhere('type', '=', 'root');
            })
            .union([
                this.db
                    .select(['id', 'name', 'type', 'project', 'description'])
                    .from(T.ROLES)
                    .innerJoin(`${T.GROUP_ROLE} as gr`, 'gr.role_id', 'id')
                    .innerJoin(
                        `${T.GROUP_USER} as gu`,
                        'gu.group_id',
                        'gr.group_id',
                    )
                    .where('gu.user_id', '=', userId)
                    .andWhere((builder) => {
                        builder
                            .whereIn('gr.project', projectIds)
                            .orWhere('type', '=', 'root');
                    }),
            ]);

        console.log(roles);

        return [];
    }
}
