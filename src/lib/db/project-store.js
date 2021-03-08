const NotFoundError = require('../error/notfound-error');

const COLUMNS = ['id', 'name', 'description', 'created_at'];
const TABLE = 'projects';

class ProjectStore {
    constructor(db, getLogger) {
        this.db = db;
        this.logger = getLogger('project-store.js');
    }

    fieldToRow(data) {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
        };
    }

    async getAll() {
        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('name', 'asc');

        return rows.map(this.mapRow);
    }

    async get(id) {
        return this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ id })
            .then(this.mapRow);
    }

    async hasProject(id) {
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

    async create(project) {
        const [id] = await this.db(TABLE)
            .insert(this.fieldToRow(project))
            .returning('id');
        return { ...project, id };
    }

    async update(data) {
        try {
            await this.db(TABLE)
                .where({ id: data.id })
                .update(this.fieldToRow(data));
        } catch (err) {
            this.logger.error('Could not update project, error: ', err);
        }
    }

    async importProjects(projects) {
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

    async dropProjects() {
        await this.db(TABLE).del();
    }

    async delete(id) {
        try {
            await this.db(TABLE)
                .where({ id })
                .del();
        } catch (err) {
            this.logger.error('Could not delete project, error: ', err);
        }
    }

    mapRow(row) {
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

module.exports = ProjectStore;
