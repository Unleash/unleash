import { Operator } from 'constants/operators';
import {ISegment} from "./segment";

export interface IFeatureStrategy {
    id: string;
    strategyName?: string;
    name: string;
    constraints: IConstraint[];
    parameters: IFeatureStrategyParameters;
    featureName?: string;
    projectId?: string;
    environment?: string;
}

export interface IFeatureStrategyParameters {
    [key: string]: string | number | undefined;
}

export interface IFeatureStrategyPayload {
    name?: string;
    constraints: IConstraint[];
    parameters: IFeatureStrategyParameters;
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


export interface IPlaygroundFeatureStrategyConstraintResult extends IConstraint {
    result: boolean;
}

export interface IPlaygroundFeatureStrategySegmentResult extends ISegment {
    result: boolean;
}

export interface IPlaygroundFeatureStrategyResult {
    type: string;
    result: boolean;
    id?: string;
    constraints?: IPlaygroundFeatureStrategyConstraintResult[];
    segments?: IPlaygroundFeatureStrategySegmentResult[];
}
