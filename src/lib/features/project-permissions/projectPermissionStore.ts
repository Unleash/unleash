import { Db } from '../../db/db';
import { Logger, LogProvider } from '../../logger';
import { IProjectPermissionStore } from './projectPermissionStoreType';

class ProjectPermissionStore implements IProjectPermissionStore {
    private db: Db;

    private logger: Logger;

    constructor(db: Db, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('project-permission-store.ts');
    }

    destroy(): void {}

    async getUserAccessibleProjects(userId: number): Promise<string[]> {
        const projects = await this.db
            .from((db) => {
                db.select('project')
                    .from('role_user')
                    .leftJoin('roles', 'role_user.role_id', 'roles.id')
                    .where('user_id', userId)
                    .union((queryBuilder) => {
                        queryBuilder
                            .select('project')
                            .from('group_role')
                            .leftJoin(
                                'group_user',
                                'group_user.group_id',
                                'group_role.group_id',
                            )
                            .where('user_id', userId);
                    })
                    .as('query');
            })
            .pluck('project');
        return projects;
    }
}

export default ProjectPermissionStore;
