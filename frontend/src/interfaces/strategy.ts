import { Operator } from 'constants/operators';

export interface IFeatureStrategy {
    id: string;
    strategyName?: string;
    name: string;
    title?: string;
    constraints: IConstraint[];
    parameters: IFeatureStrategyParameters;
    featureName?: string;
    projectId?: string;
    environment?: string;
    segments?: number[];
    disabled?: boolean;
}

export interface IFeatureStrategyParameters {
    [key: string]: string | number | undefined;
}

export interface IFeatureStrategyPayload {
    id?: string;
    name?: string;
    title?: string;
    constraints: IConstraint[];
    parameters: IFeatureStrategyParameters;
    segments?: number[];
    disabled?: boolean;
}

export interface IStrategy {
    name: string;
    displayName: string;
    editable: boolean;
    deprecated: boolean;
    description: string;
    parameters: IStrategyParameter[];
}

export interface IStrategyParameter {
    name: string;
    description: string;
    required: boolean;
    type: string;
}

export interface IStrategyPayload {
    name: string;
    description: string;
    parameters: IStrategyParameter[];
}

export interface IConstraint {
    inverted?: boolean;
    values?: string[];
    value?: string;
    caseInsensitive?: boolean;
    operator: Operator;
    contextName: string;
}

export interface IFeatureStrategySortOrder {
    id: string;
    sortOrder: number;
}
