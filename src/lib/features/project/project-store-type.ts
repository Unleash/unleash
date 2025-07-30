import type {
    IEnvironmentProjectLink,
    ProjectModeCount,
} from './project-store.js';
import type {
    IEnvironment,
    IFeatureNaming,
    IProject,
    IProjectApplications,
    IProjectLinkTemplate,
    ProjectMode,
} from '../../types/model.js';
import type { Store } from '../../types/stores/store.js';
import type { CreateFeatureStrategySchema } from '../../openapi/index.js';

export interface IProjectSettings {
    mode: ProjectMode;
    defaultStickiness: string;
    featureLimit?: number;
    featureNamingPattern?: string;
    featureNamingExample?: string;
    featureNamingDescription?: string;
    linkTemplates?: IProjectLinkTemplate[];
}

export interface IProjectInsert extends Partial<IProjectSettings> {
    id: string;
    name: string;
    description?: string;
    updatedAt?: Date;
    changeRequestsEnabled?: boolean;
    featureNaming?: IFeatureNaming;
}

export interface IProjectEnterpriseSettingsUpdate {
    id: string;
    mode?: ProjectMode;
    featureNaming?: IFeatureNaming;
    linkTemplates?: IProjectLinkTemplate[];
}

export interface IProjectHealthUpdate {
    id: string;
    health: number;
}

export interface IProjectQuery {
    id?: string;
    archived?: boolean;
}

export interface IProjectsQuery {
    ids?: string[];
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
    ): Promise<CreateFeatureStrategySchema | undefined>;

    updateDefaultStrategy(
        projectId: string,
        environment: string,
        strategy: CreateFeatureStrategySchema,
    ): Promise<CreateFeatureStrategySchema>;

    isFeatureLimitReached(id: string): Promise<boolean>;

    getProjectLinkTemplates(projectId: string): Promise<IProjectLinkTemplate[]>;

    getProjectModeCounts(): Promise<ProjectModeCount[]>;
    getApplicationsByProject(
        searchParams: IProjectApplicationsSearchParams,
    ): Promise<IProjectApplications>;

    archive(projectId: string): Promise<void>;
    revive(projectId: string): Promise<void>;
}
