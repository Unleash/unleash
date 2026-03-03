import type { Operator } from 'constants/operators';
import type { IFeatureVariant } from './featureToggle.js';
import { constraintId } from 'constants/constraintId.js';

export interface IFeatureStrategy {
    id: string;
    strategyName?: string;
    name: string;
    title?: string;
    constraints: IConstraint[];
    parameters: IFeatureStrategyParameters;
    variants?: IFeatureVariant[];
    featureName?: string;
    projectId?: string;
    environment?: string;
    segments?: number[];
    disabled?: boolean;
    sortOrder?: number;
}

export type StrategyFormState = Partial<IFeatureStrategy>; // todo (`strategyFormConsolidation`) `name` shouldn't be optional

export interface IFeatureStrategyParameters {
    [key: string]: string | number | undefined;
}

/**
 * @deprecated use `FeatureStrategySchema` from openapi
 */
export interface IFeatureStrategyPayload {
    id?: string;
    name?: string;
    title?: string;
    constraints: IConstraint[];
    parameters: IFeatureStrategyParameters;
    variants?: IFeatureVariant[];
    segments?: number[];
    disabled?: boolean;
}

export interface IStrategy {
    name: string;
    displayName: string;
    editable: boolean;
    deprecated: boolean;
    advanced?: boolean;
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
    [constraintId]?: string;
}

export interface IConstraintWithId extends IConstraint {
    [constraintId]: string;
}

export interface IFeatureStrategySortOrder {
    id: string;
    sortOrder: number;
}
