import type { Db } from '../../db/db';
import type { Logger, LogProvider } from '../../logger';
import type {
    IContextField,
    IContextFieldDto,
    IContextFieldStore,
    ILegalValue,
} from './context-field-store-type';
import NotFoundError from '../../error/notfound-error';
import type { IFlagResolver } from '../../types';

const COLUMNS = [
    'name',
    'description',
    'stickiness',
    'sort_order',
    'legal_values',
    'created_at',
    'workspace_id',
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
    workspace_id: number;
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
    workspace_id: number;
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
        workspaceId: number,
    ): Omit<ICreateContextField, 'updated_at'> {
        return {
            name: data.name,
            description: data.description || '',
            stickiness: data.stickiness || false,
            sort_order: data.sortOrder || 0,
            legal_values: JSON.stringify(data.legalValues || []),
            workspace_id: workspaceId,
        };
    }

    async getAll(workspaceId: number): Promise<IContextField[]> {
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
            .where(`${T.contextFields}.workspace_id`, '=', workspaceId)
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
    }

    async get(key: string, workspaceId: number): Promise<IContextField> {
        const row = await this.db.first(COLUMNS).from(T.contextFields).where({
            name: key,
            workspace_id: workspaceId,
        });
        if (!row) {
            throw new NotFoundError(
                `Could not find Context field with name ${key} in workspace ${workspaceId}`,
            );
        }
        return mapRow(row);
    }

    async deleteAll(): Promise<void> {
        await this.db(T.contextFields).del();
    }

    destroy(): void {}

    async exists(key: string, workspaceId: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${T.contextFields} WHERE name = ? AND workspace_id = ?) AS present`,
            [key, workspaceId],
        );
        const { present } = result.rows[0];
        return present;
    }

    // TODO: write tests for the changes you made here?
    async create(
        contextField: IContextFieldDto,
        workspaceId: number,
    ): Promise<IContextField> {
        const [row] = await this.db(T.contextFields)
            .insert(this.fieldToRow(contextField, workspaceId))
            .returning('*');

        return mapRow(row);
    }

    async update(
        data: IContextFieldDto,
        workspaceId: number,
    ): Promise<IContextField> {
        const [row] = await this.db(T.contextFields)
            .where({
                name: data.name,
                workspace_id: workspaceId,
            })
            .update(this.fieldToRow(data, workspaceId))
            .returning('*');

        return mapRow(row);
    }

    async delete(name: string, workspaceId: number): Promise<void> {
        await this.db(T.contextFields)
            .where({
                name,
                workspace_id: workspaceId,
            })
            .del();
    }

    async count(workspaceId: number): Promise<number> {
        return this.db(T.contextFields)
            .where({ workspace_id: workspaceId })
            .count('*')
            .then((res) => Number(res[0].count));
    }
}
export default ContextFieldStore;
