import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';

import NotFoundError from '../error/notfound-error';
import { IEnvironmentOverview, IFeatureOverview } from '../types/model';

const COLUMNS = ['id', 'name', 'description', 'created_at', 'health'];
const TABLE = 'projects';

export interface IProject {
    id: string;
    name: string;
    description: string;
    health: number;
    createdAt: Date;
}

interface IProjectInsert {
    id: string;
    name: string;
    description: string;
}

interface IProjectArchived {
    id: string;
    archived: boolean;
}

interface IProjectHealthUpdate {
    id: string;
    health: number;
}

class ProjectStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('project-store.js');
    }

    fieldToRow(data): IProjectInsert {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
        };
    }

    async getAll(): Promise<IProject[]> {
        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('name', 'asc');

        return rows.map(this.mapRow);
    }

    async get(id: string): Promise<IProject> {
        return this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ id })
            .then(this.mapRow);
    }

    async hasProject(id: string): Promise<IProjectArchived> {
        return this.db
            .first('id')
            .from(TABLE)
            .where({ id })
            .then(row => {
                if (!row) {
                    throw new NotFoundError(`No project with id=${id} found`);
                }
                return {
                    id: row.id,
                    archived: row.archived === 1,
                };
            });
    }

    async updateHealth(healthUpdate: IProjectHealthUpdate): Promise<void> {
        await this.db(TABLE)
            .where({ id: healthUpdate.id })
            .update({ health: healthUpdate.health });
    }

    async create(project): Promise<IProject> {
        const [id] = await this.db(TABLE)
            .insert(this.fieldToRow(project))
            .returning('id');
        return { ...project, id };
    }

    async update(data): Promise<void> {
        try {
            await this.db(TABLE)
                .where({ id: data.id })
                .update(this.fieldToRow(data));
        } catch (err) {
            this.logger.error('Could not update project, error: ', err);
        }
    }

    async importProjects(projects): Promise<IProject[]> {
        const rows = await this.db(TABLE)
            .insert(projects.map(this.fieldToRow))
            .returning(COLUMNS)
            .onConflict('id')
            .ignore();
        if (rows.length > 0) {
            return rows.map(this.mapRow);
        }
        return [];
    }

    async dropProjects(): Promise<void> {
        await this.db(TABLE).del();
    }

    async delete(id: string): Promise<void> {
        try {
            await this.db(TABLE)
                .where({ id })
                .del();
        } catch (err) {
            this.logger.error('Could not delete project, error: ', err);
        }
    }

    async deleteEnvironment(id: string, environment: string): Promise<void> {
        await this.db('project_environments')
            .where({
                project_id: id,
                environment_name: environment,
            })
            .del();
    }

    async getMembers(projectId: string): Promise<number> {
        const rolesFromProject = this.db('role_permission')
            .select('role_id')
            .distinct()
            .where({ project: projectId });

        const numbers = await this.db('role_user')
            .countDistinct('user_id as members')
            .whereIn('role_id', rolesFromProject)
            .first();
        const { members } = numbers;
        if (typeof members === 'string') {
            return parseInt(members, 10);
        }
        return members;
    }

    async getProjectOverview(
        projectId: string,
        archived: boolean = false,
    ): Promise<IFeatureOverview[]> {
        const rows = await this.db('features')
            .where({ project: projectId, archived })
            .select(
                'features.name as feature_name',
                'features.type as type',
                'features.created_at as created_at',
                'features.last_seen_at as last_seen_at',
                'features.stale as stale',
                'feature_environments.enabled as enabled',
                'feature_environments.environment as environment',
                'environments.display_name as display_name',
            )
            .fullOuterJoin(
                'feature_environments',
                'feature_environments.feature_name',
                'features.name',
            )
            .fullOuterJoin(
                'environments',
                'feature_environments.environment',
                'environments.name',
            );
        if (rows.length > 0) {
            const overview = rows.reduce((acc, r) => {
                if (acc[r.feature_name] !== undefined) {
                    acc[r.feature_name].environments.push(
                        this.getEnvironment(r),
                    );
                } else {
                    acc[r.feature_name] = {
                        type: r.type,
                        name: r.feature_name,
                        createdAt: r.created_at,
                        lastSeenAt: r.last_seen_at,
                        stale: r.stale,
                        environments: [this.getEnvironment(r)],
                    };
                }
                return acc;
            }, {});
            return Object.values(overview).map((o: IFeatureOverview) => ({
                ...o,
                environments: o.environments.filter(f => f.name),
            }));
        }
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private getEnvironment(r: any): IEnvironmentOverview {
        return {
            name: r.environment,
            displayName: r.display_name,
            enabled: r.enabled,
        };
    }

    mapRow(row): IProject {
        if (!row) {
            throw new NotFoundError('No project found');
        }

        return {
            id: row.id,
            name: row.name,
            description: row.description,
            createdAt: row.created_at,
            health: row.health || 100,
        };
    }
}
export default ProjectStore;
module.exports = ProjectStore;
