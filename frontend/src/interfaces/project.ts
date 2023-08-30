import { ProjectStatsSchema } from 'openapi';
import { IFeatureToggleListItem } from './featureToggle';
import { ProjectEnvironmentType } from '../component/project/Project/ProjectFeatureToggles/hooks/useEnvironmentsRef';

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

export type FlagNamingType = {
    pattern: string;
    example: string;
};

export interface IProject {
    id?: string;
    members: number;
    version: string;
    name: string;
    description?: string;
    environments: Array<ProjectEnvironmentType>;
    health: number;
    stats: ProjectStatsSchema;
    favorite: boolean;
    features: IFeatureToggleListItem[];
    mode: 'open' | 'protected';
    defaultStickiness: string;
    featureLimit?: number;
    flagNaming?: FlagNamingType;
}

export interface IProjectHealthReport extends IProject {
    staleCount: number;
    potentiallyStaleCount: number;
    activeCount: number;
    updatedAt: string;
}

export interface IProjectRoleUsageCount {
    project: string;
    role: number;
    userCount: number;
    groupCount: number;
    serviceAccountCount: number;
}
