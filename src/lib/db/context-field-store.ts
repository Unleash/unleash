'use strict';

import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';

const COLUMNS = [
    'name',
    'description',
    'stickiness',
    'sort_order',
    'legal_values',
    'created_at',
];
const TABLE = 'context_fields';

const mapRow: (IContextRow) => IContextField = row => ({
    name: row.name,
    description: row.description,
    stickiness: row.stickiness,
    sortOrder: row.sort_order,
    legalValues: row.legal_values ? row.legal_values.split(',') : undefined,
    createdAt: row.created_at,
});

export interface ICreateContextField {
    name: string;
    description: string;
    stickiness: boolean;
    sort_order: number;
    legal_values?: string[];
    updated_at: Date;
}

export interface IContextField {
    name: string;
    description: string;
    stickiness: boolean;
    sortOrder: number;
    legalValues?: string[];
    createdAt: Date;
}

class ContextFieldStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('context-field-store.js');
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    fieldToRow(data): ICreateContextField {
        return {
            name: data.name,
            description: data.description,
            stickiness: data.stickiness,
            sort_order: data.sortOrder, // eslint-disable-line
            legal_values: data.legalValues ? data.legalValues.join(',') : null, // eslint-disable-line
            updated_at: data.createdAt, // eslint-disable-line
        };
    }

    async getAll(): Promise<IContextField[]> {
        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('name', 'asc');

        return rows.map(mapRow);
    }

    async get(name: string): Promise<IContextField> {
        return this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ name })
            .then(mapRow);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async create(contextField): Promise<void> {
        return this.db(TABLE).insert(this.fieldToRow(contextField));
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async update(data): Promise<void> {
        return this.db(TABLE)
            .where({ name: data.name })
            .update(this.fieldToRow(data));
    }

    async delete(name: string): Promise<void> {
        return this.db(TABLE)
            .where({ name })
            .del();
    }
}
export default ContextFieldStore;
module.exports = ContextFieldStore;
