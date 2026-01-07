import type { Db } from '../../db/db.js';
import type { LogProvider } from '../../logger.js';
import type { IPrivateProjectStore } from './privateProjectStoreType.js';
import { ADMIN_TOKEN_USER } from '../../types/index.js';

export type ProjectAccess =
    | {
          mode: 'all';
      }
    | {
          mode: 'limited';
          projects: string[];
      };

export const ALL_PROJECT_ACCESS: ProjectAccess = {
    mode: 'all',
};

class PrivateProjectStore implements IPrivateProjectStore {
    private db: Db;

    constructor(db: Db, _getLogger: LogProvider) {
        this.db = db;
    }

    destroy(): void {}

    async getUserAccessibleProjects(userId: number): Promise<ProjectAccess> {
        if (userId === ADMIN_TOKEN_USER.id) {
            return ALL_PROJECT_ACCESS;
        }
        const isViewer = await this.db('role_user')
            .join('roles', 'role_user.role_id', 'roles.id')
            .where('role_user.user_id', userId)
            .andWhere({
                'roles.name': 'Viewer',
                'roles.type': 'root',
            })
            .whereNotExists((builder) => {
                builder
                    .select('*')
                    .from('group_user')
                    .join('groups', 'group_user.group_id', 'groups.id')
                    .join(
                        'roles as group_roles',
                        'groups.root_role_id',
                        'group_roles.id',
                    )
                    .whereRaw('group_user.user_id = role_user.user_id')
                    .whereIn('group_roles.name', ['Admin', 'Editor'])
                    .andWhere('group_roles.type', 'root');
            })
            .count('*')
            .then((res) => Number(res[0].count));

        if (isViewer === 0) {
            return ALL_PROJECT_ACCESS;
        }

        const accessibleProjects: string[] = await this.db
            .from((db) => {
                db.distinct()
                    .select('projects.id as project_id')
                    .from('projects')
                    .leftJoin(
                        'project_settings',
                        'projects.id',
                        'project_settings.project',
                    )
                    .where((builder) => {
                        builder
                            .whereNull('project_settings.project')
                            .orWhere(
                                'project_settings.project_mode',
                                '!=',
                                'private',
                            );
                    })
                    .unionAll((queryBuilder) => {
                        queryBuilder
                            .select('projects.id as project_id')
                            .from('projects')
                            .join(
                                'project_settings',
                                'projects.id',
                                'project_settings.project',
                            )
                            .where(
                                'project_settings.project_mode',
                                '=',
                                'private',
                            )
                            .whereIn('projects.id', (whereBuilder) => {
                                whereBuilder
                                    .select('role_user.project')
                                    .from('role_user')
                                    .leftJoin(
                                        'roles',
                                        'role_user.role_id',
                                        'roles.id',
                                    )
                                    .where('role_user.user_id', userId);
                            })
                            .orWhereIn('projects.id', (whereBuilder) => {
                                whereBuilder
                                    .select('group_role.project')
                                    .from('group_role')
                                    .leftJoin(
                                        'group_user',
                                        'group_user.group_id',
                                        'group_role.group_id',
                                    )
                                    .where('group_user.user_id', userId);
                            });
                    })
                    .as('accessible_projects');
            })
            .select('*')
            .pluck('project_id');

        return { mode: 'limited', projects: accessibleProjects };
    }
}

export default PrivateProjectStore;
