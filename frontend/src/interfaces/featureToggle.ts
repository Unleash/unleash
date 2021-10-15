import { IFeatureStrategy } from './strategy';

export interface IFeatureToggleListItem {
    type: string;
    name: string;
    environments: IEnvironments[];
}

export interface IEnvironments {
    name: string;
    enabled: boolean;
}

export interface IFeatureToggleDTO {
    stale: boolean;
    archived: boolean;
    description: string;
    name: string;
    project: string;
    type: string;
    variants: IFeatureVariant[];
}

export interface IFeatureToggle {
    stale: boolean;
    archived: boolean;
    createdAt: Date;
    lastSeenAt?: Date;
    description: string;
    environments: IFeatureEnvironment[];
    name: string;
    project: string;
    type: string;
    variants: IFeatureVariant[];
}

export interface IFeatureEnvironment {
    type: string;
    name: string;
    enabled: boolean;
    strategies: IFeatureStrategy[];
}

export interface IFeatureVariant {
    name: string;
    stickiness: string;
    weight: number;
    weightType: string;
    overrides: IOverride[];
    payload?: IPayload;
}

export interface IOverride {
    contextName: string;
    values: string[];
}

export interface IPayload {
    name: string;
    value: string;
}

export interface IFeatureEnvironmentMetrics {
    environment: string;
    timestamp: string;
    yes: number;
    no: number;
}

export interface IFeatureMetrics {
    version: number;
    maturity: string;
    lastHourUsage: IFeatureEnvironmentMetrics[],
    seenApplications: string[]
}
