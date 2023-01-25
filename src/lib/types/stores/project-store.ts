import {
    IEnvironmentProjectLink,
    IProjectMembersCount,
} from '../../db/project-store';
import { IEnvironment, IProject, IProjectWithCount } from '../model';
import { Store } from './store';

export interface IProjectInsert {
    id: string;
    name: string;
    description: string;
    updatedAt?: Date;
    changeRequestsEnabled?: boolean;
}

export interface IProjectArchived {
    id: string;
    archived: boolean;
}

export interface IProjectHealthUpdate {
    id: string;
    health: number;
}

export interface IProjectQuery {
    id?: string;
}

export interface IProjectEnvironmentWithChangeRequests {
    environment: string;
    changeRequestsEnabled: boolean;
}

export interface IProjectStore extends Store<IProject, string> {
    hasProject(id: string): Promise<boolean>;

    updateHealth(healthUpdate: IProjectHealthUpdate): Promise<void>;

    create(project: IProjectInsert): Promise<IProject>;

    update(update: IProjectInsert): Promise<void>;

    importProjects(
        projects: IProjectInsert[],
        environments?: IEnvironment[],
    ): Promise<IProject[]>;

    addEnvironmentToProject(id: string, environment: string): Promise<void>;

    deleteEnvironmentForProject(id: string, environment: string): Promise<void>;

    getEnvironmentsForProject(id: string): Promise<string[]>;

    getMembersCountByProject(projectId: string): Promise<number>;

    getProjectsByUser(userId: number): Promise<string[]>;

    getMembersCount(): Promise<IProjectMembersCount[]>;

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
}
