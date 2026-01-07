import type { ProjectMode } from '../../types/index.js';
import type { IProjectQuery, IProjectsQuery } from './project-store-type.js';

export type ProjectForUi = {
    id: string;
    name: string;
    description?: string;
    health: number;
    technicalDebt: number;
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
    technicalDebt: number;
    memberCount: number;
    featureCount: number;
    staleFeatureCount: number;
    potentiallyStaleFeatureCount: number;
    avgTimeToProduction: number;
    /**
     * @deprecated
     */
    health: number;
};

export interface IProjectReadModel {
    getProjectsForAdminUi(
        query?: IProjectQuery & IProjectsQuery,
        userId?: number,
    ): Promise<ProjectForUi[]>;
    getProjectsForInsights(
        query?: IProjectQuery,
    ): Promise<ProjectForInsights[]>;
    getFeatureProject(
        featureName: string,
    ): Promise<{ project: string; createdAt: Date } | null>;
    getProjectsByUser(userId: number): Promise<string[]>;
    getProjectsFavoritedByUser(userId: number): Promise<string[]>;
}
