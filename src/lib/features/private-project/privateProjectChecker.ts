import type { IUnleashConfig, IUnleashStores } from '../../types/index.js';
import type { IPrivateProjectStore } from './privateProjectStoreType.js';
import type { IPrivateProjectChecker } from './privateProjectCheckerType.js';
import {
    ALL_PROJECT_ACCESS,
    type ProjectAccess,
} from './privateProjectStore.js';

export class PrivateProjectChecker implements IPrivateProjectChecker {
    private privateProjectStore: IPrivateProjectStore;

    private isEnterprise: boolean;

    constructor(
        { privateProjectStore }: Pick<IUnleashStores, 'privateProjectStore'>,
        { isEnterprise }: Pick<IUnleashConfig, 'isEnterprise'>,
    ) {
        this.privateProjectStore = privateProjectStore;
        this.isEnterprise = isEnterprise;
    }

    async getUserAccessibleProjects(userId: number): Promise<ProjectAccess> {
        return this.isEnterprise
            ? this.privateProjectStore.getUserAccessibleProjects(userId)
            : Promise.resolve(ALL_PROJECT_ACCESS);
    }

    async filterUserAccessibleProjects(
        userId: number,
        projects: string[],
    ): Promise<string[]> {
        if (!this.isEnterprise) {
            return projects;
        }
        const accessibleProjects =
            await this.privateProjectStore.getUserAccessibleProjects(userId);
        if (accessibleProjects.mode === 'all') return projects;
        return projects.filter((project) =>
            accessibleProjects.projects.includes(project),
        );
    }

    async hasAccessToProject(
        userId: number,
        projectId: string,
    ): Promise<boolean> {
        const projectAccess = await this.getUserAccessibleProjects(userId);
        return (
            projectAccess.mode === 'all' ||
            projectAccess.projects.includes(projectId)
        );
    }
}
