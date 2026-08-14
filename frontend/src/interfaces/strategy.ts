import type { Operator } from 'constants/operators';
import type { IFeatureVariant } from './featureToggle.js';
import { constraintId } from 'constants/constraintId.js';
import type { ParametersSchema } from 'openapi/index.js';

export interface IFeatureStrategy {
    id: string;
    /** @deprecated use {@link name} instead */ // todo(v9) remove this
    strategyName?: string;
    name: string;
    title?: string;
    constraints: IConstraint[];
    parameters: ParametersSchema;
    variants?: IFeatureVariant[];
    featureName?: string;
    projectId?: string;
    environment?: string;
    segments?: number[];
    disabled?: boolean;
    sortOrder?: number;
}

export type StrategyFormParameters = Partial<ParametersSchema>;
export type StrategyFormState = Omit<Partial<IFeatureStrategy>, 'parameters'> &
    Required<Pick<IFeatureStrategy, 'name'>> & {
        parameters?: StrategyFormParameters;
    };

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
