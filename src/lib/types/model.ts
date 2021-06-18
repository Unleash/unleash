import { IProject } from '../db/project-store';

export interface IConstraint {
    contextName: string;
    operator: string;
    values: string[];
}

export interface IStrategyConfig {
    id: string;
    name: string;
    constraints: IConstraint[];
    parameters: Object;
}

export interface IVariant {
    name: string;
    weight: number;
    weightType: string;
    payload: {
        type: string;
        value: string;
    };
    stickiness: string;
    overrides: {
        contextName: string;
        values: string[];
    }[];
}

export interface IEnvironment {
    name: string;
    displayName: string;
}

export interface IEnvironmentOverview {
    name: string;
    displayName: string;
    enabled: boolean;
}

export interface IFeatureOverview {
    name: string;
    type: string;
    environments: IEnvironmentOverview[];
}

export interface IProjectOverview {
    name: string;
    description: string;
    features: IFeatureOverview[];
    members: number;
    version: number;
}

export interface IProjectParam {
    projectId: string;
}
