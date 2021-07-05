import { IFeatureStrategy } from '../db/feature-strategy-store';

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
export interface FeatureToggleDTO {
    name: string;
    description?: string;
    type?: string;
    stale?: boolean;
    variants?: IVariant[];
    createdAt?: Date;
}
export interface FeatureToggle extends FeatureToggleDTO {
    project: string;
    lastSeenAt?: Date;
    createdAt?: Date;
}

export interface IFeatureToggleClient {
    name: string;
    description: string;
    type: string;
    project: string;
    stale: boolean;
    variants: IVariant[];
    enabled: boolean;
    strategies: IStrategyConfig[];
}

export interface IFeatureEnvironmentInfo {
    name: string;
    environment: string;
    enabled: boolean;
    strategies: IFeatureStrategy[];
}

export interface FeatureToggleWithEnvironment extends FeatureToggle {
    environments: IEnvironmentDetail[];
}

export interface IEnvironmentDetail extends IEnvironmentOverview {
    strategies: IStrategyConfig[];
}

export interface IFeatureEnvironment {
    environment: string;
    featureName: string;
    enabled: boolean;
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
    health: number;
}

export interface IProjectParam {
    projectId: string;
}
export interface ITagQuery {
    tagType: string;
    tagValue: string;
}
export interface IFeatureToggleQuery {
    tag?: string[][];
    project?: string[];
    namePrefix?: string;
    environment?: string;
}

export interface ITag {
    value: string;
    type: string;
}
