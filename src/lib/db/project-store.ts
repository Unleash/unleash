import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';

import NotFoundError from '../error/notfound-error';
import { IProject } from '../types/model';
import {
    IProjectHealthUpdate,
    IProjectInsert,
    IProjectQuery,
    IProjectStore,
} from '../types/stores/project-store';
import { DEFAULT_ENV } from '../util/constants';

const COLUMNS = [
    'id',
    'name',
    'description',
    'created_at',
    'health',
    'updated_at',
];
const TABLE = 'projects';

class ProjectStore implements IProjectStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('project-store.ts');
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    fieldToRow(data): IProjectInsert {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
        };
    }

    destroy(): void {}

    async exists(id: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async getAll(query: IProjectQuery = {}): Promise<IProject[]> {
        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .where(query)
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

    async hasProject(id: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async updateHealth(healthUpdate: IProjectHealthUpdate): Promise<void> {
        await this.db(TABLE)
            .where({ id: healthUpdate.id })
            .update({ health: healthUpdate.health, updated_at: new Date() });
    }

    async create(project: IProjectInsert): Promise<IProject> {
        const row = await this.db(TABLE)
            .insert(this.fieldToRow(project))
            .returning('*');
        return this.mapRow(row[0]);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async update(data): Promise<void> {
        try {
            await this.db(TABLE)
                .where({ id: data.id })
                .update(this.fieldToRow(data));
        } catch (err) {
            this.logger.error('Could not update project, error: ', err);
        }
    }

    async importProjects(projects: IProjectInsert[]): Promise<IProject[]> {
        const rows = await this.db(TABLE)
            .insert(projects.map(this.fieldToRow))
            .returning(COLUMNS)
            .onConflict('id')
            .ignore();
        if (rows.length > 0) {
            await this.addDefaultEnvironment(rows);
            return rows.map(this.mapRow);
        }
        return [];
    }

    async addDefaultEnvironment(projects: any[]): Promise<void> {
        const environments = projects.map((p) => ({
            project_id: p.id,
            environment_name: DEFAULT_ENV,
        }));
        await this.db('project_environments')
            .insert(environments)
            .onConflict(['project_id', 'environment_name'])
            .ignore();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    async delete(id: string): Promise<void> {
        try {
            await this.db(TABLE).where({ id }).del();
        } catch (err) {
            this.logger.error('Could not delete project, error: ', err);
        }
    }

    async deleteEnvironmentForProject(
        id: string,
        environment: string,
    ): Promise<void> {
        await this.db('project_environments')
            .where({
                project_id: id,
                environment_name: environment,
            })
            .del();
    }

    async addEnvironmentToProject(
        id: string,
        environment: string,
    ): Promise<void> {
        await this.db('project_environments')
            .insert({ project_id: id, environment_name: environment })
            .onConflict(['project_id', 'environment_name'])
            .ignore();
    }

    async getEnvironmentsForProject(id: string): Promise<string[]> {
        return this.db('project_environments')
            .where({
                project_id: id,
            })
            .pluck('environment_name');
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

    async count(): Promise<number> {
        return this.db
            .count('*')
            .from(TABLE)
            .then((res) => Number(res[0].count));
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
            updatedAt: row.updated_at || new Date(),
        };
    }
}
export default ProjectStore;
module.exports = ProjectStore;
