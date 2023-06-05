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
}

export interface IProjectHealthReport extends IProject {
    staleCount: number;
    potentiallyStaleCount: number;
    activeCount: number;
    updatedAt: string;
}
