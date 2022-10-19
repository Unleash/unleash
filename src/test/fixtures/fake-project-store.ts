import {
    IProjectHealthUpdate,
    IProjectInsert,
    IProjectStore,
} from '../../lib/types/stores/project-store';
import { IProject, IProjectWithCount } from '../../lib/types/model';
import NotFoundError from '../../lib/error/notfound-error';
import {
    IEnvironmentProjectLink,
    IProjectMembersCount,
} from 'lib/db/project-store';

export default class FakeProjectStore implements IProjectStore {
    projects: IProject[] = [];

    projectEnvironment: Map<string, Set<string>> = new Map();

    getEnvironmentsForProject(): Promise<string[]> {
        throw new Error('Method not implemented.');
    }

    getProjectLinksForEnvironments(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        environments: string[],
    ): Promise<IEnvironmentProjectLink[]> {
        throw new Error('Method not implemented.');
    }

    async addEnvironmentToProject(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        id: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        environment: string,
    ): Promise<void> {
        const environments = this.projectEnvironment.get(id) || new Set();
        environments.add(environment);
        this.projectEnvironment.set(id, environments);
    }

    async getProjectsWithCounts(): Promise<IProjectWithCount[]> {
        return this.projects.map((p) => {
            return { ...p, memberCount: 0, featureCount: 0 };
        });
    }

    private createInternal(project: IProjectInsert): IProject {
        const newProj: IProject = {
            ...project,
            health: 100,
            createdAt: new Date(),
        };
        this.projects.push(newProj);
        return newProj;
    }

    async create(project: IProjectInsert): Promise<IProject> {
        return this.createInternal(project);
    }

    async delete(key: string): Promise<void> {
        this.projects.splice(
            this.projects.findIndex((p) => p.id === key),
            1,
        );
    }

    async deleteAll(): Promise<void> {
        this.projects = [];
    }

    async deleteEnvironmentForProject(
        id: string,
        environment: string,
    ): Promise<void> {
        const environments = this.projectEnvironment.get(id);
        if (environments) {
            environments.delete(environment);
            this.projectEnvironment.set(id, environments);
        }
    }

    destroy(): void {}

    async count(): Promise<number> {
        return this.projects.length;
    }

    async exists(key: string): Promise<boolean> {
        return this.projects.some((p) => p.id === key);
    }

    async get(key: string): Promise<IProject> {
        const project = this.projects.find((p) => p.id === key);
        if (project) {
            return project;
        }
        throw new NotFoundError(`Could not find project with id: ${key}`);
    }

    async getAll(): Promise<IProject[]> {
        return this.projects;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getMembersCountByProject(projectId: string): Promise<number> {
        return Promise.resolve(0);
    }

    async hasProject(id: string): Promise<boolean> {
        return this.exists(id);
    }

    async importProjects(projects: IProjectInsert[]): Promise<IProject[]> {
        return projects.map((p) => this.createInternal(p));
    }

    async update(update: IProjectInsert): Promise<void> {
        await this.delete(update.id);
        this.createInternal(update);
    }

    async updateHealth(healthUpdate: IProjectHealthUpdate): Promise<void> {
        this.projects.find((p) => p.id === healthUpdate.id).health =
            healthUpdate.health;
    }

    getMembersCount(): Promise<IProjectMembersCount[]> {
        throw new Error('Method not implemented.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getProjectsByUser(userId: number): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
}
