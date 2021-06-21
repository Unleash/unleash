import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';

const NotFoundError = require('../error/notfound-error');

const COLUMNS = ['id', 'name', 'description', 'created_at'];
const TABLE = 'projects';

export interface IProject {
    id: string;
    name: string;
    description: string;
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

    mapRow(row): IProject {
        if (!row) {
            throw new NotFoundError('No project found');
        }

        return {
            id: row.id,
            name: row.name,
            description: row.description,
            createdAt: row.created_at,
        };
    }
}
export default ProjectStore;
module.exports = ProjectStore;
