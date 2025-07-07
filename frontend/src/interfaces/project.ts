import type { ProjectStatsSchema } from 'openapi';
import type { IFeatureFlagListItem } from './featureToggle.js';
import type { ProjectEnvironmentType } from 'component/project/Project/ProjectFeatureToggles/hooks/useEnvironmentsRef';
import type { ProjectMode } from 'component/project/Project/hooks/useProjectEnterpriseSettingsForm';

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
    features: IFeatureFlagListItem[];
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
