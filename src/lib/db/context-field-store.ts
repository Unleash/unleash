import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import {
    IContextField,
    IContextFieldDto,
    IContextFieldStore,
    ILegalValue,
} from '../types/stores/context-field-store';

const COLUMNS = [
    'name',
    'description',
    'stickiness',
    'sort_order',
    'legal_values',
    'created_at',
];
const TABLE = 'context_fields';

type ContextFieldDB = {
    name: string;
    description: string;
    stickiness: boolean;
    sort_order: number;
    legal_values: ILegalValue[];
    created_at: Date;
};

const mapRow = (row: ContextFieldDB): IContextField => ({
    name: row.name,
    description: row.description,
    stickiness: row.stickiness,
    sortOrder: row.sort_order,
    legalValues: row.legal_values || [],
    createdAt: row.created_at,
});

interface ICreateContextField {
    name: string;
    description: string;
    stickiness: boolean;
    sort_order: number;
    legal_values?: string;
    updated_at: Date;
}

class ContextFieldStore implements IContextFieldStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('context-field-store.ts');
    }

    fieldToRow(
        data: IContextFieldDto,
    ): Omit<ICreateContextField, 'updated_at'> {
        return {
            name: data.name,
            description: data.description,
            stickiness: data.stickiness,
            sort_order: data.sortOrder, // eslint-disable-line
            legal_values: JSON.stringify(data.legalValues || []),
        };
    }

    async getAll(): Promise<IContextField[]> {
        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('name', 'asc');

        return rows.map(mapRow);
    }

    async get(key: string): Promise<IContextField> {
        return this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ name: key })
            .then(mapRow);
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE name = ?) AS present`,
            [key],
        );
        const { present } = result.rows[0];
        return present;
    }

    // TODO: write tests for the changes you made here?
    async create(contextField: IContextFieldDto): Promise<IContextField> {
        const [row] = await this.db(TABLE)
            .insert(this.fieldToRow(contextField))
            .returning('*');

        return mapRow(row);
    }

    async update(data: IContextFieldDto): Promise<IContextField> {
        const [row] = await this.db(TABLE)
            .where({ name: data.name })
            .update(this.fieldToRow(data))
            .returning('*');

        return mapRow(row);
    }

    async delete(name: string): Promise<void> {
        return this.db(TABLE).where({ name }).del();
    }
}
export default ContextFieldStore;
