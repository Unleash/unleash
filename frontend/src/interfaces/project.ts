import { ProjectStatsSchema } from 'openapi';
import { IFeatureToggleListItem } from './featureToggle';
import { ProjectEnvironmentType } from 'component/project/Project/ProjectFeatureToggles/hooks/useEnvironmentsRef';
import { ProjectMode } from 'component/project/Project/hooks/useProjectEnterpriseSettingsForm';

export interface IProjectCard {
    name: string;
    id: string;
    createdAt: string;
    health: number;
    description: string;
    featureCount: number;
    mode: string;
    memberCount?: number;
    favorite?: boolean;
}

export type FeatureNamingType = {
    pattern: string;
    example: string;
    description: string;
};

export type FeatureTypeCount = {
    type: string;
    count: number;
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
    mode: ProjectMode;
    defaultStickiness: string;
    featureLimit?: number;
    featureNaming?: FeatureNamingType;
}

export interface IProjectOverview {
    id?: string;
    members: number;
    version: string;
    name: string;
    description?: string;
    environments: Array<ProjectEnvironmentType>;
    health: number;
    stats: ProjectStatsSchema;
    featureTypeCounts: FeatureTypeCount[];
    favorite: boolean;
    mode: ProjectMode;
    defaultStickiness: string;
    featureLimit?: number;
    featureNaming?: FeatureNamingType;
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
