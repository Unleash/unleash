import { NotFoundError } from '../../error/index.js';
import type {
    IProjectJsonSchema,
    IProjectJsonSchemaStore,
} from './project-json-schema-store-type.js';

export default class FakeProjectJsonSchemaStore
    implements IProjectJsonSchemaStore
{
    private schemas: IProjectJsonSchema[] = [];

    async insert(
        item: Omit<IProjectJsonSchema, 'id' | 'createdAt'>,
    ): Promise<IProjectJsonSchema> {
        const newSchema: IProjectJsonSchema = {
            ...item,
            id: String(Math.random()),
            createdAt: new Date(),
        };
        this.schemas.push(newSchema);
        return newSchema;
    }

    async update(
        id: string,
        item: Omit<IProjectJsonSchema, 'id' | 'createdAt'>,
    ): Promise<IProjectJsonSchema> {
        const index = this.schemas.findIndex((s) => s.id === id);
        if (index === -1) {
            throw new NotFoundError(`Could not find JSON schema with id ${id}`);
        }
        const updated: IProjectJsonSchema = {
            ...this.schemas[index],
            ...item,
            id,
        };
        this.schemas[index] = updated;
        return updated;
    }

    async getByProject(projectId: string): Promise<IProjectJsonSchema[]> {
        return this.schemas.filter((s) => s.project === projectId);
    }

    async get(id: string): Promise<IProjectJsonSchema> {
        const schema = this.schemas.find((s) => s.id === id);
        if (!schema) {
            throw new NotFoundError(`Could not find JSON schema with id ${id}`);
        }
        return schema;
    }

    async getAll(): Promise<IProjectJsonSchema[]> {
        return this.schemas;
    }

    async exists(id: string): Promise<boolean> {
        return this.schemas.some((s) => s.id === id);
    }

    async delete(id: string): Promise<void> {
        const index = this.schemas.findIndex((s) => s.id === id);
        if (index !== -1) {
            this.schemas.splice(index, 1);
        }
    }

    async deleteAll(): Promise<void> {
        this.schemas = [];
    }

    destroy(): void {}
}
