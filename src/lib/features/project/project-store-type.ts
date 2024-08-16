import type {
    IEnvironmentProjectLink,
    ProjectModeCount,
} from './project-store';
import type {
    IEnvironment,
    IFeatureNaming,
    IProject,
    IProjectApplications,
    IProjectWithCount,
    ProjectMode,
} from '../../types/model';
import type { Store } from '../../types/stores/store';
import type { CreateFeatureStrategySchema } from '../../openapi';

export interface IProjectInsert {
    id: string;
    name: string;
    description?: string;
    updatedAt?: Date;
    changeRequestsEnabled?: boolean;
    mode?: ProjectMode;
    featureLimit?: number;
    featureNaming?: IFeatureNaming;
}

export interface IProjectEnterpriseSettingsUpdate {
    id: string;
    mode?: ProjectMode;
    featureNaming?: IFeatureNaming;
}

export interface IProjectSettings {
    mode: ProjectMode;
    defaultStickiness: string;
    featureLimit?: number;
    featureNamingPattern?: string;
    featureNamingExample?: string;
    featureNamingDescription?: string;
}

export interface IProjectHealthUpdate {
    id: string;
    health: number;
}

export interface IProjectQuery {
    id?: string;
    archived?: boolean;
}

export type ProjectEnvironment = {
    environment: string;
    changeRequestEnabled?: boolean;
    defaultStrategy?: CreateFeatureStrategySchema;
};

export interface IProjectApplicationsSearchParams {
    searchParams?: string[];
    project?: string;
    offset: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

export interface IProjectStore extends Store<IProject, string> {
    hasProject(id: string): Promise<boolean>;

    hasActiveProject(id: string): Promise<boolean>;

    updateHealth(healthUpdate: IProjectHealthUpdate): Promise<void>;

    create(project: IProjectInsert): Promise<IProject>;

    update(update: IProjectInsert): Promise<void>;

    updateProjectEnterpriseSettings(
        update: IProjectEnterpriseSettingsUpdate,
    ): Promise<void>;

    importProjects(
        projects: IProjectInsert[],
        environments?: IEnvironment[],
    ): Promise<IProject[]>;

    addEnvironmentToProject(id: string, environment: string): Promise<void>;

    deleteEnvironmentForProject(id: string, environment: string): Promise<void>;

    getEnvironmentsForProject(id: string): Promise<ProjectEnvironment[]>;

    getMembersCountByProject(projectId: string): Promise<number>;

    getMembersCountByProjectAfterDate(
        projectId: string,
        date: string,
    ): Promise<number>;

    getProjectsByUser(userId: number): Promise<string[]>;

    /**
     * @deprecated Use the appropriate method in the project read model instead.
     */
    getProjectsWithCounts(
        query?: IProjectQuery,
        userId?: number,
    ): Promise<IProjectWithCount[]>;

    count(): Promise<number>;

    getAll(query?: IProjectQuery): Promise<IProject[]>;

    getProjectLinksForEnvironments(
        environments: string[],
    ): Promise<IEnvironmentProjectLink[]>;

    addEnvironmentToProjects(
        environment: string,
        projects: string[],
    ): Promise<void>;

    getDefaultStrategy(
        projectId: string,
        environment: string,
    ): Promise<CreateFeatureStrategySchema | null>;

    updateDefaultStrategy(
        projectId: string,
        environment: string,
        strategy: CreateFeatureStrategySchema,
    ): Promise<CreateFeatureStrategySchema>;

    isFeatureLimitReached(id: string): Promise<boolean>;

    getProjectModeCounts(): Promise<ProjectModeCount[]>;
    getApplicationsByProject(
        searchParams: IProjectApplicationsSearchParams,
    ): Promise<IProjectApplications>;

    archive(projectId: string): Promise<void>;
    revive(projectId: string): Promise<void>;
}
