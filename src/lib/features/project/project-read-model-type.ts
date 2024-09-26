import type { ProjectMode } from '../../types';
import type { IProjectQuery } from './project-store-type';

export type ProjectForUi = {
    id: string;
    name: string;
    description?: string;
    health: number;
    createdAt: Date;
    mode: ProjectMode;
    memberCount: number;
    favorite: boolean;
    archivedAt?: Date;
    featureCount: number;
    lastReportedFlagUsage: Date | null;
    lastUpdatedAt: Date | null;
};

export type ProjectForInsights = {
    id: string;
    health: number;
    memberCount: number;
    featureCount: number;
    staleFeatureCount: number;
    potentiallyStaleFeatureCount: number;
    avgTimeToProduction: number;
};

export interface IProjectReadModel {
    getProjectsForAdminUi(
        query?: IProjectQuery,
        userId?: number,
    ): Promise<ProjectForUi[]>;
    getProjectsForInsights(
        query?: IProjectQuery,
    ): Promise<ProjectForInsights[]>;
    getFeatureProject(
        featureName: string,
    ): Promise<{ project: string; createdAt: Date } | null>;
    getProjectsByUser(userId: number): Promise<string[]>;
}
