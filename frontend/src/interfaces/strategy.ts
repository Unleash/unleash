import { Operator } from 'constants/operators';

export interface IFeatureStrategy {
    id: string;
    name: string;
    constraints: IConstraint[];
    parameters: IParameter;
}

export interface IStrategy {
    name: string;
    displayName: string;
    editable: boolean;
    deprecated: boolean;
    description: string;
    parameters: IParameter[];
}

export interface IConstraint {
    inverted?: boolean;
    values?: string[];
    value?: string;
    caseInsensitive?: boolean;
    operator: Operator;
    contextName: string;
    [index: string]: unknown;
}

export interface IParameter {
    groupId?: string;
    rollout?: number;
    stickiness?: string;

    [index: string]: any;
}

export interface IStrategyPayload {
    name?: string;
    constraints: IConstraint[];
    parameters: IParameter;
}
