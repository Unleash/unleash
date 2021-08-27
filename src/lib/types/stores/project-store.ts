import { IFeatureOverview, IProject } from '../model';
import { Store } from './store';

export interface IProjectInsert {
    id: string;
    name: string;
    description: string;
}

export interface IProjectArchived {
    id: string;
    archived: boolean;
}

export interface IProjectHealthUpdate {
    id: string;
    health: number;
}

export interface IProjectStore extends Store<IProject, string> {
    hasProject(id: string): Promise<boolean>;
    updateHealth(healthUpdate: IProjectHealthUpdate): Promise<void>;
    create(project: IProjectInsert): Promise<IProject>;
    update(update: IProjectInsert): Promise<void>;
    importProjects(projects: IProjectInsert[]): Promise<IProject[]>;
    addEnvironmentToProject(id: string, environment: string): Promise<void>;
    deleteEnvironmentForProject(id: string, environment: string): Promise<void>;
    getEnvironmentsForProject(id: string): Promise<string[]>;
    getMembers(projectId: string): Promise<number>;
    getProjectOverview(
        projectId: string,
        archived: boolean,
    ): Promise<IFeatureOverview[]>;
    count(): Promise<number>;
}
