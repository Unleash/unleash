'use strict';

const {
    CONTEXT_FIELD_CREATED,
    CONTEXT_FIELD_UPDATED,
    CONTEXT_FIELD_DELETED,
} = require('../event-type');

const COLUMNS = [
    'name',
    'description',
    'sort_order',
    'legal_values',
    'created_at',
];
const TABLE = 'context_fields';

const mapRow = row => ({
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
    legalValues: row.legal_values ? row.legal_values.split(',') : undefined,
    createdAt: row.created_at,
});

class ContextFieldStore {
    constructor(db, customContextFields, eventStore, getLogger) {
        this.db = db;
        this.logger = getLogger('context-field-store.js');
        this._createFromConfig(customContextFields);

        eventStore.on(CONTEXT_FIELD_CREATED, event =>
            this._createContextField(event.data),
        );
        eventStore.on(CONTEXT_FIELD_UPDATED, event =>
            this._updateContextField(event.data),
        );
        eventStore.on(CONTEXT_FIELD_DELETED, event => {
            this._deleteContextField(event.data);
        });
    }

    async _createFromConfig(customContextFields) {
        if (customContextFields && customContextFields.length > 0) {
            this.logger.info(
                'Create custom context fields',
                customContextFields,
            );
            const conextFields = await this.getAll();
            customContextFields
                .filter(c => !conextFields.some(cf => cf.name === c.name))
                .forEach(async field => {
                    try {
                        await this._createContextField(field);
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
            sort_order: data.sortOrder, // eslint-disable-line
            legal_values: data.legalValues ? data.legalValues.join(',') : null, // eslint-disable-line
            updated_at: data.createdAt, // eslint-disable-line
        };
    }

    getAll() {
        return this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('name', 'asc')
            .map(mapRow);
    }

    get(name) {
        return this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ name })
            .then(mapRow);
    }

    _createContextField(contextField) {
        return this.db(TABLE)
            .insert(this.fieldToRow(contextField))
            .catch(err =>
                this.logger.error(
                    'Could not insert contextField, error: ',
                    err,
                ),
            );
    }

    _updateContextField(data) {
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

    _deleteContextField({ name }) {
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
