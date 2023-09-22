import { IUnleashConfig, IUnleashStores } from '../../types';
import { IPrivateProjectStore } from './privateProjectStoreType';
import { IPrivateProjectChecker } from './privateProjectCheckerType';
import { ALL_PROJECT_ACCESS, ProjectAccess } from './privateProjectStore';

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
