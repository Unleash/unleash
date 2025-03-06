import type { Store } from '../../types/stores/store';

export interface IContextFieldDto {
    name: string;
    description?: string | null;
    stickiness?: boolean;
    sortOrder?: number;
    usedInProjects?: number | null;
    usedInFeatures?: number | null;
    legalValues?: ILegalValue[];
}

export interface ILegalValue {
    value: string;
    description?: string;
}

export interface IContextField extends IContextFieldDto {
    createdAt: Date;
}

export interface IContextFieldStore
    extends Omit<
        Store<IContextField, string>,
        'get' | 'getAll' | 'exists' | 'delete'
    > {
    get(name: string, workspaceId: number): Promise<IContextField>;
    getAll(workspaceId: number): Promise<IContextField[]>;
    exists(name: string, workspaceId: number): Promise<boolean>;
    delete(name: string, workspaceId: number): Promise<void>;
    create(data: IContextFieldDto, workspaceId: number): Promise<IContextField>;
    update(data: IContextFieldDto, workspaceId: number): Promise<IContextField>;
    count(workspaceId: number): Promise<number>;
}
