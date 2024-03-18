import type { Store } from './store';

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

export interface IContextFieldStore extends Store<IContextField, string> {
    create(data: IContextFieldDto): Promise<IContextField>;
    update(data: IContextFieldDto): Promise<IContextField>;
    count(): Promise<number>;
}
