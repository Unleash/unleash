import type {
    IEnvironment,
    IProject,
    IProjectApplications,
    IProjectStore,
    IProjectWithCount,
} from '../../lib/types';
import NotFoundError from '../../lib/error/notfound-error';
import type {
    IEnvironmentProjectLink,
    ProjectModeCount,
} from '../../lib/features/project/project-store';
import type { CreateFeatureStrategySchema } from '../../lib/openapi';
import type {
    IProjectApplicationsSearchParams,
    IProjectHealthUpdate,
    IProjectInsert,
    IProjectQuery,
    ProjectEnvironment,
} from '../../lib/features/project/project-store-type';

type ArchivableProject = IProject & { archivedAt: null | Date };

export default class FakeProjectStore implements IProjectStore {
    projects: ArchivableProject[] = [];

    projectEnvironment: Map<string, Set<string>> = new Map();

    getEnvironmentsForProject(): Promise<ProjectEnvironment[]> {
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

    async getProjectsWithCounts(
        query?: IProjectQuery,
    ): Promise<IProjectWithCount[]> {
        return this.projects
            .filter((project) =>
                query?.archived
                    ? project.archivedAt !== null
                    : project.archivedAt === null,
            )
            .map((project) => {
                return {
                    ...project,
                    memberCount: 0,
                    featureCount: 0,
                    staleFeatureCount: 0,
                    potentiallyStaleFeatureCount: 0,
                    avgTimeToProduction: 0,
                };
            });
    }

    private createInternal(project: IProjectInsert): IProject {
        const newProj: ArchivableProject = {
            ...project,
            health: 100,
            createdAt: new Date(),
            mode: 'open',
            defaultStickiness: 'default',
            archivedAt: null,
        };
        this.projects.push(newProj);
        return newProj;
    }

    async create(project: IProjectInsert): Promise<IProject> {
        return this.createInternal(project);
    }

    async delete(key: string): Promise<void> {
        this.projects.splice(
            this.projects.findIndex((project) => project.id === key),
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
        return this.projects.filter((project) => project.archivedAt === null)
            .length;
    }

    async get(key: string): Promise<IProject> {
        const project = this.projects.find((p) => p.id === key);
        if (project) {
            return project;
        }
        throw new NotFoundError(`Could not find project with id: ${key}`);
    }

    async getAll(): Promise<IProject[]> {
        return this.projects.filter((project) => project.archivedAt === null);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getMembersCountByProject(projectId: string): Promise<number> {
        return Promise.resolve(0);
    }

    async exists(key: string): Promise<boolean> {
        return this.projects.some((project) => project.id === key);
    }

    async hasProject(id: string): Promise<boolean> {
        return this.exists(id);
    }

    async hasActiveProject(id: string): Promise<boolean> {
        return this.projects.some(
            (project) => project.id === id && project.archivedAt === null,
        );
    }

    async importProjects(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        projects: IProjectInsert[],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        environments?: IEnvironment[],
    ): Promise<IProject[]> {
        return projects.map((project) => this.createInternal(project));
    }

    async update(update: IProjectInsert): Promise<void> {
        await this.delete(update.id);
        this.createInternal(update);
    }

    async updateHealth(healthUpdate: IProjectHealthUpdate): Promise<void> {
        this.projects.find(
            (project) => project.id === healthUpdate.id,
        )!.health = healthUpdate.health;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getProjectsByUser(userId: number): Promise<string[]> {
        return Promise.resolve([]);
    }

    addEnvironmentToProjects(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        environment: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        projects: string[],
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async getMembersCountByProjectAfterDate(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        projectId: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        date: string,
    ): Promise<number> {
        return 0;
    }

    updateDefaultStrategy(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        projectId: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        environment: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        strategy: CreateFeatureStrategySchema,
    ): Promise<CreateFeatureStrategySchema> {
        throw new Error('Method not implemented.');
    }

    getDefaultStrategy(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        projectId: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        environment: string,
    ): Promise<CreateFeatureStrategySchema | null> {
        throw new Error('Method not implemented.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isFeatureLimitReached(id: string): Promise<boolean> {
        return Promise.resolve(false);
    }

    getProjectModeCounts(): Promise<ProjectModeCount[]> {
        return Promise.resolve([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateProjectEnterpriseSettings(update: IProjectInsert): Promise<void> {
        throw new Error('Method not implemented.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getApplicationsByProject(
        searchParams: IProjectApplicationsSearchParams,
    ): Promise<IProjectApplications> {
        throw new Error('Method not implemented.');
    }

    async archive(id: string): Promise<void> {
        this.projects = this.projects.map((project) =>
            project.id === id
                ? { ...project, archivedAt: new Date() }
                : project,
        );
    }

    async revive(id: string): Promise<void> {
        this.projects = this.projects.map((project) =>
            project.id === id ? { ...project, archivedAt: null } : project,
        );
    }
}
