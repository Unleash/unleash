import { CreateFeatureStrategySchema } from '../openapi';
import { IFeatureStrategy } from './strategy';

export interface IEnvironment {
    name: string;
    type: string;
    createdAt: string;
    sortOrder: number;
    enabled: boolean;
    protected: boolean;
    projectCount?: number;
    apiTokenCount?: number;
    enabledToggleCount?: number;
}

export interface IProjectEnvironment extends IEnvironment {
    projectVisible?: boolean;
    projectApiTokenCount?: number;
    projectEnabledToggleCount?: number;
    defaultStrategy?: Partial<IFeatureStrategy> | CreateFeatureStrategySchema;
}

export type ProjectEnvironmentType = {
    environment: string;
    defaultStrategy?: CreateFeatureStrategySchema;
};

export interface IEnvironmentPayload {
    name: string;
    type: string;
}

export interface IEnvironmentEditPayload {
    sortOrder: number;
    type: string;
}

export interface IEnvironmentClonePayload {
    name: string;
    type: string;
    projects: string[];
    clonePermissions: boolean;
}

export interface IEnvironmentResponse {
    environments: IEnvironment[];
}

export interface ISortOrderPayload {
    [index: string]: number;
}
