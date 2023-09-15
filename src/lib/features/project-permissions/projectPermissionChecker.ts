import { IUnleashStores } from '../../types';
import { IProjectPermissionStore } from './projectPermissionStoreType';
import { IProjectPermissionChecker } from './projectPermissionCheckerType';

export class ProjectPermissionChecker implements IProjectPermissionChecker {
    private projectPermissionStore: IProjectPermissionStore;

    constructor({
        projectPermissionStore,
    }: Pick<IUnleashStores, 'projectPermissionStore'>) {
        this.projectPermissionStore = projectPermissionStore;
    }

    async getUserAccessibleProjects(userId: number): Promise<string[]> {
        return this.projectPermissionStore.getUserAccessibleProjects(userId);
    }
}
