import { IFeatureToggleListItem } from './featureToggle';

export interface IProjectCard {
    name: string;
    id: string;
    createdAt: string;
    health: number;
    description: string;
    featureCount: number;
    memberCount: number;
}

export interface IProject {
    members: number;
    version: string;
    name: string;
    description: string;
    environments: string[];
    health: number;
    features: IFeatureToggleListItem[];
}

export interface IProjectHealthReport extends IProject {
    staleCount: number;
    potentiallyStaleCount: number;
    activeCount: number;
}
