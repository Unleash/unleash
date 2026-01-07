import type { CreateFeatureSchemaType, FeatureSchema } from 'openapi';
import type { IFeatureStrategy } from './strategy.js';
import type { ITag } from './tags.js';
import type { IReleasePlan } from './releasePlans.js';

/**
 * @deprecated use FeatureSchema from openapi
 */
export interface IFeatureFlagListItem {
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
    lastSeenAt?: string | null;
    type?: string;
    hasStrategies?: boolean;
    hasEnabledStrategies?: boolean;
    yes?: number;
    no?: number;
}

export type ILastSeenEnvironments = Pick<
    IEnvironments,
    'name' | 'enabled' | 'lastSeenAt' | 'yes' | 'no'
>;

export type Lifecycle = {
    stage: Required<FeatureSchema>['lifecycle']['stage'];
    status?: string;
    enteredStageAt: string;
};

export type Collaborator = {
    id: number;
    name: string;
    imageUrl: string;
};

export type CollaboratorData = {
    users: Collaborator[];
};

export type FeatureLink = { url: string; title: string | null; id: string };

/**
 * @deprecated use FeatureSchema from openapi
 */
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
    type: CreateFeatureSchemaType;
    variants: IFeatureVariant[];
    impressionData: boolean;
    strategies?: IFeatureStrategy[];
    dependencies: Array<IDependency>;
    lifecycle?: Lifecycle;
    children: Array<string>;
    createdBy?: {
        id: number;
        name: string;
        imageUrl: string;
    };
    collaborators?: CollaboratorData;
    links?: FeatureLink[];
}

export interface IDependency {
    feature: string;
    enabled?: boolean;
    variants?: string[];
}

export interface IFeatureEnvironment {
    type: string;
    name: string;
    enabled: boolean;
    strategies: IFeatureStrategy[];
    variants?: IFeatureVariant[];
    lastSeenAt?: string;
    yes?: number;
    no?: number;
    releasePlans?: IReleasePlan[];
}

export interface IFeatureEnvironmentWithCrEnabled extends IFeatureEnvironment {
    crEnabled?: boolean;
}

/**
 * @deprecated use `StrategyVariantSchema` from openapi
 */
export interface IFeatureVariant {
    name: string;
    stickiness: string;
    weight: number;
    weightType: 'fix' | 'variable';
    overrides?: IOverride[];
    payload?: IPayload;
}

export interface IOverride {
    contextName: string;
    values: string[];
}

export interface IPayload {
    type: 'string' | 'number' | 'json' | 'csv';
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
    variants?: Record<string, number>;
}
