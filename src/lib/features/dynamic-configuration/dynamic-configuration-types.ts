import type { IConstraint } from '../../types/model.js';

export type DynamicConfigurationType = 'string' | 'number' | 'boolean' | 'json';

export type DynamicConfigurationValue =
    | string
    | number
    | boolean
    | Record<string, unknown>
    | unknown[];

export interface DynamicConfigurationVersion {
    version: number;
    value: DynamicConfigurationValue;
    description?: string;
    createdAt: string;
}

export interface DynamicConfigurationOverride {
    id: string;
    priority: number;
    constraints: IConstraint[];
    segments?: number[];
    version: number;
}

export interface DynamicConfigurationEnvironment {
    defaultVersion: number;
    overrides: DynamicConfigurationOverride[];
}

export interface DynamicConfiguration {
    key: string;
    project: string;
    description: string;
    type: DynamicConfigurationType;
    validation?: {
        minimum?: number;
        maximum?: number;
        legalValues?: DynamicConfigurationValue[];
    };
    versions: DynamicConfigurationVersion[];
    environments: Record<string, DynamicConfigurationEnvironment>;
    createdAt: string;
    updatedAt: string;
}

export type UpsertDynamicConfiguration = Omit<
    DynamicConfiguration,
    'key' | 'project' | 'versions' | 'createdAt' | 'updatedAt'
> & {
    versions: Array<Omit<DynamicConfigurationVersion, 'createdAt'>>;
};

export interface CompiledDynamicConfigurationPayload {
    type: 'json' | 'string' | 'number';
    value: string;
}

export interface CompiledDynamicConfigurationVersion {
    version: number;
    payload: CompiledDynamicConfigurationPayload;
}

export interface CompiledDynamicConfigurationRule {
    expression: string;
    version: number;
}

export interface CompiledDynamicConfiguration {
    name: string;
    project: string;
    type: DynamicConfigurationType;
    versions: CompiledDynamicConfigurationVersion[];
    rules: CompiledDynamicConfigurationRule[];
}
