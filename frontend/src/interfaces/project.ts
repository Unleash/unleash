import type { ProjectSchema, ProjectStatsSchema } from 'openapi';
import type { IFeatureFlagListItem } from './featureToggle';
import type { ProjectEnvironmentType } from 'component/project/Project/ProjectFeatureToggles/hooks/useEnvironmentsRef';
import type { ProjectMode } from 'component/project/Project/hooks/useProjectEnterpriseSettingsForm';

export interface IProjectCard {
    name: string;
    id: string;
    createdAt: string | Date;
    health?: number;
    description?: string;
    featureCount?: number;
    mode?: string;
    memberCount?: number;
    onHover?: () => void;
    favorite?: boolean;
    owners?: ProjectSchema['owners'];
    lastUpdatedAt?: Date | string;
    lastReportedFlagUsage?: Date | string;
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
    features: IFeatureFlagListItem[];
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
    archivedAt?: Date;
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
