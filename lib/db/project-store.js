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
        await this.db(TABLE)
            .insert(this.fieldToRow(project))
            .catch(err =>
                this.logger.error('Could not insert project, error: ', err),
            );
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
