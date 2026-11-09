import type { ProjectMode } from '../../types/index.js';
import type { OnboardingStatus } from '../onboarding/onboarding-read-model-type.js';
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
    onboardingStatus?: OnboardingStatus;
    cleanupCount?: number;
};

export type ProjectCore = {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    archivedAt?: Date;
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
    getProjectsCore(query?: IProjectQuery): Promise<ProjectCore[]>;
    getFeatureProject(
        featureName: string,
    ): Promise<{ project: string; createdAt: Date } | null>;
    getProjectsByUser(userId: number): Promise<string[]>;
    getProjectsFavoritedByUser(userId: number): Promise<string[]>;
}
