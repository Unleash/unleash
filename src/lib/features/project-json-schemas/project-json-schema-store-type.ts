import type { Store } from '../../types/stores/store.js';

export interface IProjectJsonSchema {
    id: string;
    project: string;
    name: string;
    schema: Record<string, unknown>;
    createdAt: Date;
}

export interface IProjectJsonSchemaStore
    extends Store<IProjectJsonSchema, string> {
    insert(
        item: Omit<IProjectJsonSchema, 'id' | 'createdAt'>,
    ): Promise<IProjectJsonSchema>;
    update(
        id: string,
        item: Omit<IProjectJsonSchema, 'id' | 'createdAt'>,
    ): Promise<IProjectJsonSchema>;
    getByProject(projectId: string): Promise<IProjectJsonSchema[]>;
}
