import { ProjectStatsSchema } from 'openapi';
import { IFeatureToggleListItem } from './featureToggle';

export interface IProjectCard {
    name: string;
    id: string;
    createdAt: string;
    health: number;
    description: string;
    featureCount: number;
    memberCount?: number;
    favorite?: boolean;
}

export interface IProject {
    id?: string;
    members: number;
    version: string;
    name: string;
    description?: string;
    environments: string[];
    health: number;
    stats: ProjectStatsSchema;
    favorite: boolean;
    features: IFeatureToggleListItem[];
    mode: 'open' | 'protected';
}

export interface IProjectHealthReport extends IProject {
    staleCount: number;
    potentiallyStaleCount: number;
    activeCount: number;
    updatedAt: string;
}

export interface IPermission {
    id: number;
    name: string;
    displayName: string;
    environment?: string;
}

export interface IProjectRolePermissions {
    project: IPermission[];
    environments: IProjectEnvironmentPermissions[];
}

export interface IProjectEnvironmentPermissions {
    name: string;
    permissions: IPermission[];
}
