import { IFeatureStrategy } from './strategy';
import { ITag } from './tags';

export interface IFeatureToggleListItem {
    type: string;
    name: string;
    stale?: boolean;
    lastSeenAt?: string;
    createdAt: string;
    environments: IEnvironments[];
    tags?: ITag[];
    favorite?: boolean;
}

export interface IEnvironments {
    name: string;
    enabled: boolean;
    variantCount: number;
}

export interface IFeatureToggle {
    stale: boolean;
    archived: boolean;
    enabled?: boolean;
    createdAt: string;
    lastSeenAt?: string;
    description?: string;
    environments: IFeatureEnvironment[];
    name: string;

    favorite: boolean;
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
    variants?: IFeatureVariant[];
}

export interface IFeatureEnvironmentWithCrEnabled extends IFeatureEnvironment {
    crEnabled?: boolean;
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
    variants: Record<string, number>;
}
