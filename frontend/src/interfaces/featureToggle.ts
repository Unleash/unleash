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

export interface IFeatureTogglePayload {
    description: string;
    name: string;
    projectId: string;
    type: string;
    impressionData: boolean;
}

export interface IFeatureToggle {
    stale: boolean;
    archived: boolean;
    enabled?: boolean;
    createdAt: string;
    lastSeenAt?: string;
    description: string;
    environments: IFeatureEnvironment[];
    name: string;
    project: string;
    type: string;
    variants: IFeatureVariant[];
    impressionData: boolean;
    strategies?: IFeatureStrategy[];
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
    type: string;
    value: string;
}

export interface IFeatureEnvironmentMetrics {
    environment: string;
    timestamp: string;
    yes: number;
    no: number;
}

export interface IFeatureMetrics {
    version?: number;
    maturity?: string;
    lastHourUsage: IFeatureEnvironmentMetrics[];
    seenApplications: string[];
}

export interface IFeatureMetricsRaw {
    featureName: string;
    appName: string;
    environment: string;
    timestamp: string;
    yes: number;
    no: number;
}
