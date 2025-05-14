import type { IPrivateProjectChecker } from './privateProjectCheckerType.js';
import {
    ALL_PROJECT_ACCESS,
    type ProjectAccess,
} from './privateProjectStore.js';

export class FakePrivateProjectChecker implements IPrivateProjectChecker {
    async filterUserAccessibleProjects(
        userId: number,
        projects: string[],
    ): Promise<string[]> {
        return projects;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getUserAccessibleProjects(userId: number): Promise<ProjectAccess> {
        return ALL_PROJECT_ACCESS;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hasAccessToProject(userId: number, projectId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}
