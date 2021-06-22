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

export interface IFeatureToggle {
    name: string;
    description: string;
    type: string;
    project: string;
    stale: boolean;
    variants: IVariant[];
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

export interface IFeatureToggleQuery {
    tag: string[];
    project: string[];
    namePrefix: string;
}

export interface ITag {
    value: string;
    type: string;
}
