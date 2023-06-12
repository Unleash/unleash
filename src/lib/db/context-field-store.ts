import { Db } from './db';
import { Logger, LogProvider } from '../logger';
import {
    IContextField,
    IContextFieldDto,
    IContextFieldStore,
    ILegalValue,
} from '../types/stores/context-field-store';
import NotFoundError from '../error/notfound-error';
import { IFlagResolver } from '../types';

const COLUMNS = [
    'name',
    'description',
    'stickiness',
    'sort_order',
    'legal_values',
    'created_at',
];
const T = {
    contextFields: 'context_fields',
    featureStrategies: 'feature_strategies',
};

type ContextFieldDB = {
    name: string;
    description: string;
    stickiness: boolean;
    sort_order: number;
    used_in_projects?: number;
    used_in_features?: number;
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
    ...(row.used_in_projects && {
        usedInProjects: Number(row.used_in_projects),
    }),
    ...(row.used_in_features && {
        usedInFeatures: Number(row.used_in_features),
    }),
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
    private db: Db;

    private logger: Logger;

    private flagResolver: IFlagResolver;

    constructor(db: Db, getLogger: LogProvider, flagResolver: IFlagResolver) {
        this.db = db;
        this.flagResolver = flagResolver;
        this.logger = getLogger('context-field-store.ts');
    }

    prefixColumns(columns: string[] = COLUMNS): string[] {
        return columns.map((c) => `${T.contextFields}.${c}`);
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
        if (this.flagResolver.isEnabled('segmentContextFieldUsage')) {
            const rows = await this.db
                .select(
                    this.prefixColumns(),
                    'used_in_projects',
                    'used_in_features',
                )
                .countDistinct(
                    `${T.featureStrategies}.project_name AS used_in_projects`,
                )
                .countDistinct(
                    `${T.featureStrategies}.feature_name AS used_in_features`,
                )
                .from(T.contextFields)
                .joinRaw(
                    `LEFT JOIN ${T.featureStrategies} ON EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements(${T.featureStrategies}.constraints) AS elem
                        WHERE elem ->> 'contextName' = ${T.contextFields}.name
                      )`,
                )
                .groupBy(
                    this.prefixColumns(
                        COLUMNS.filter((column) => column !== 'legal_values'),
                    ),
                )
                .orderBy('name', 'asc');
            return rows.map(mapRow);
        } else {
            const rows = await this.db
                .select(COLUMNS)
                .from(T.contextFields)
                .orderBy('name', 'asc');

            return rows.map(mapRow);
        }
    }

    async get(key: string): Promise<IContextField> {
        const row = await this.db
            .first(COLUMNS)
            .from(T.contextFields)
            .where({ name: key });
        if (!row) {
            throw new NotFoundError(
                `Could not find Context field with name ${key}`,
            );
        }
        return mapRow(row);
    }

    async deleteAll(): Promise<void> {
        await this.db(T.contextFields).del();
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${T.contextFields} WHERE name = ?) AS present`,
            [key],
        );
        const { present } = result.rows[0];
        return present;
    }

    // TODO: write tests for the changes you made here?
    async create(contextField: IContextFieldDto): Promise<IContextField> {
        const [row] = await this.db(T.contextFields)
            .insert(this.fieldToRow(contextField))
            .returning('*');

        return mapRow(row);
    }

    async update(data: IContextFieldDto): Promise<IContextField> {
        const [row] = await this.db(T.contextFields)
            .where({ name: data.name })
            .update(this.fieldToRow(data))
            .returning('*');

        return mapRow(row);
    }

    async delete(name: string): Promise<void> {
        return this.db(T.contextFields).where({ name }).del();
    }

    async count(): Promise<number> {
        return this.db(T.contextFields)
            .count('*')
            .then((res) => Number(res[0].count));
    }
}
export default ContextFieldStore;
