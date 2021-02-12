'use strict';

const COLUMNS = [
    'name',
    'description',
    'stickiness',
    'sort_order',
    'legal_values',
    'created_at',
];
const TABLE = 'context_fields';

const mapRow = row => ({
    name: row.name,
    description: row.description,
    stickiness: row.stickiness,
    sortOrder: row.sort_order,
    legalValues: row.legal_values ? row.legal_values.split(',') : undefined,
    createdAt: row.created_at,
});

class ContextFieldStore {
    constructor(db, customContextFields, getLogger) {
        this.db = db;
        this.logger = getLogger('context-field-store.js');
        this._createFromConfig(customContextFields);
    }

    async _createFromConfig(customContextFields) {
        if (customContextFields && customContextFields.length > 0) {
            this.logger.info(
                'Create custom context fields',
                customContextFields,
            );
            const contextFields = await this.getAll();
            customContextFields
                .filter(c => !contextFields.some(cf => cf.name === c.name))
                .forEach(async field => {
                    try {
                        await this.create(field);
                    } catch (e) {
                        this.logger.error(e);
                    }
                });
        }
    }

    fieldToRow(data) {
        return {
            name: data.name,
            description: data.description,
            stickiness: data.stickiness,
            sort_order: data.sortOrder, // eslint-disable-line
            legal_values: data.legalValues ? data.legalValues.join(',') : null, // eslint-disable-line
            updated_at: data.createdAt, // eslint-disable-line
        };
    }

    async getAll() {
        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('name', 'asc');

        return rows.map(mapRow);
    }

    async get(name) {
        return this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ name })
            .then(mapRow);
    }

    async create(contextField) {
        return this.db(TABLE)
            .insert(this.fieldToRow(contextField))
            .catch(err =>
                this.logger.error(
                    'Could not insert contextField, error: ',
                    err,
                ),
            );
    }

    async update(data) {
        return this.db(TABLE)
            .where({ name: data.name })
            .update(this.fieldToRow(data))
            .catch(err =>
                this.logger.error(
                    'Could not update context field, error: ',
                    err,
                ),
            );
    }

    async delete(name) {
        return this.db(TABLE)
            .where({ name })
            .del()
            .catch(err => {
                this.logger.error(
                    'Could not delete context field, error: ',
                    err,
                );
            });
    }
}

module.exports = ContextFieldStore;
