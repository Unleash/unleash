import type { Db } from '../../db/db.js';
import type { IProjectJsonSchemaStore } from './project-json-schema-store-type.js';
import type { IProjectJsonSchema } from './project-json-schema-store-type.js';
import { CRUDStore, type CrudStoreConfig } from '../../db/crud/crud-store.js';
import type { Row } from '../../db/crud/row-type.js';
import { ulid } from 'ulidx';

type ProjectJsonSchemaRow = Row<IProjectJsonSchema>;

export class ProjectJsonSchemaStore
    extends CRUDStore<
        IProjectJsonSchema,
        Omit<IProjectJsonSchema, 'id' | 'createdAt'>,
        ProjectJsonSchemaRow,
        Row<Omit<IProjectJsonSchema, 'id' | 'createdAt'>>,
        string
    >
    implements IProjectJsonSchemaStore
{
    constructor(db: Db, config: CrudStoreConfig) {
        super('project_json_schemas', db, config, {
            fromRow: (row: Partial<ProjectJsonSchemaRow>) => ({
                id: row.id!,
                project: row.project!,
                name: row.name!,
                schema:
                    typeof row.schema === 'string'
                        ? JSON.parse(row.schema)
                        : row.schema!,
                createdAt: new Date(row.created_at!),
            }),
            toRow: (
                item: Partial<Omit<IProjectJsonSchema, 'id' | 'createdAt'>>,
            ) => {
                const row: Record<string, unknown> = {};
                if (item.project !== undefined) row.project = item.project;
                if (item.name !== undefined) row.name = item.name;
                if (item.schema !== undefined)
                    row.schema = JSON.stringify(item.schema);
                return row as any;
            },
        });
    }

    async insert(
        item: Omit<IProjectJsonSchema, 'id' | 'createdAt'>,
    ): Promise<IProjectJsonSchema> {
        const id = ulid();
        const row = {
            id,
            project: item.project,
            name: item.name,
            schema: JSON.stringify(item.schema),
        };
        const [inserted] = await this.db(this.tableName)
            .insert(row)
            .returning('*');
        return this.fromRow(inserted) as IProjectJsonSchema;
    }

    async update(
        id: string,
        item: Omit<IProjectJsonSchema, 'id' | 'createdAt'>,
    ): Promise<IProjectJsonSchema> {
        const row: Record<string, unknown> = {};
        if (item.name !== undefined) row.name = item.name;
        if (item.schema !== undefined) row.schema = JSON.stringify(item.schema);

        const [updated] = await this.db(this.tableName)
            .where({ id })
            .update(row)
            .returning('*');
        return this.fromRow(updated) as IProjectJsonSchema;
    }

    async getByProject(projectId: string): Promise<IProjectJsonSchema[]> {
        const rows = await this.db(this.tableName).where({
            project: projectId,
        });
        return rows.map(this.fromRow) as IProjectJsonSchema[];
    }
}
