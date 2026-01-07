import type { Store } from '../../types/stores/store.js';

export interface IContextFieldDto {
    name: string;
    description?: string | null;
    stickiness?: boolean;
    sortOrder?: number;
    usedInProjects?: number | null;
    usedInFeatures?: number | null;
    legalValues?: ILegalValue[];
    project?: string;
}

export interface ILegalValue {
    value: string;
    description?: string;
}

export interface IContextField extends IContextFieldDto {
    createdAt: Date;
}

export interface IContextFieldStore extends Store<IContextField, string> {
    create(data: IContextFieldDto): Promise<IContextField>;
    update(data: IContextFieldDto): Promise<IContextField>;
    count(): Promise<number>;
    countProjectFields(): Promise<number>;
}
