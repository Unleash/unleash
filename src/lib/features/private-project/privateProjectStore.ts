import { Db } from '../../db/db';
import { Logger, LogProvider } from '../../logger';
import { IPrivateProjectStore } from './privateProjectStoreType';

class PrivateProjectStore implements IPrivateProjectStore {
    private db: Db;

    private logger: Logger;

    constructor(db: Db, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('project-permission-store.ts');
    }

    destroy(): void {}

    async getUserAccessibleProjects(userId: number): Promise<string[]> {
        // -1 user is ADMIN api token
        if (userId === -1) {
            const allProjects = await this.db('projects').pluck('id');
            return allProjects;
        }
        const isViewer = await this.db('role_user')
            .join('roles', 'role_user.role_id', 'roles.id')
            .where('role_user.user_id', userId)
            .andWhere({
                'roles.name': 'Viewer',
                'roles.type': 'root',
            })
            .count('*')
            .first();

        if (!isViewer || isViewer.count == 0) {
            const allProjects = await this.db('projects').pluck('id');
            return allProjects;
        }

        const accessibleProjects = await this.db
            .from((db) => {
                db.distinct()
                    .select('projects.id as project_id')
                    .from('projects')
                    .leftJoin(
                        'project_settings',
                        'projects.id',
                        'project_settings.project',
                    )
                    .where('project_settings.project_mode', '!=', 'private')
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

        return accessibleProjects;
    }
}

export default PrivateProjectStore;
