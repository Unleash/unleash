import type {
    IEnvironment,
    IProject,
    IProjectApplications,
    IProjectLinkTemplate,
    IProjectStore,
} from '../../lib/types/index.js';
import NotFoundError from '../../lib/error/notfound-error.js';
import type {
    IEnvironmentProjectLink,
    ProjectModeCount,
} from '../../lib/features/project/project-store.js';
import type { CreateFeatureStrategySchema } from '../../lib/openapi/index.js';
import type {
    IProjectApplicationsSearchParams,
    IProjectHealthUpdate,
    IProjectInsert,
    ProjectEnvironment,
} from '../../lib/features/project/project-store-type.js';

type ArchivableProject = Omit<IProject, 'archivedAt'> & {
    archivedAt: null | Date;
};

export default class FakeProjectStore implements IProjectStore {
    projects: ArchivableProject[] = [];

    projectEnvironment: Map<string, Set<string>> = new Map();

    getEnvironmentsForProject(): Promise<ProjectEnvironment[]> {
        throw new Error('Method not implemented.');
    }

    getProjectLinksForEnvironments(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _environments: string[],
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
        return newProj as IProject;
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
            return project as IProject;
        }
        throw new NotFoundError(`Could not find project with id: ${key}`);
    }

    async getAll(): Promise<IProject[]> {
        return this.projects
            .filter((project) => project.archivedAt === null)
            .map((p) => p as IProject);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getMembersCountByProject(_projectId: string): Promise<number> {
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
        _environments?: IEnvironment[],
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

    addEnvironmentToProjects(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _environment: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _projects: string[],
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async getMembersCountByProjectAfterDate(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _projectId: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _date: string,
    ): Promise<number> {
        return 0;
    }

    updateDefaultStrategy(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _projectId: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _environment: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _strategy: CreateFeatureStrategySchema,
    ): Promise<CreateFeatureStrategySchema> {
        throw new Error('Method not implemented.');
    }

    getDefaultStrategy(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _projectId: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _environment: string,
    ): Promise<CreateFeatureStrategySchema | undefined> {
        throw new Error('Method not implemented.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isFeatureLimitReached(_id: string): Promise<boolean> {
        return Promise.resolve(false);
    }

    async getProjectLinkTemplates(
        _id: string,
    ): Promise<IProjectLinkTemplate[]> {
        return [] as IProjectLinkTemplate[];
    }

    getProjectModeCounts(): Promise<ProjectModeCount[]> {
        return Promise.resolve([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateProjectEnterpriseSettings(_update: IProjectInsert): Promise<void> {
        throw new Error('Method not implemented.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getApplicationsByProject(
        _searchParams: IProjectApplicationsSearchParams,
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
