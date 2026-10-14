import type { IPrivateProjectChecker } from './privateProjectCheckerType.js';
import {
    ALL_PROJECT_ACCESS,
    type ProjectAccess,
} from './privateProjectStore.js';

export class FakePrivateProjectChecker implements IPrivateProjectChecker {
    inaccessibleProjects: string[] = [];

    async filterUserAccessibleProjects(
        _userId: number,
        projects: string[],
    ): Promise<string[]> {
        return projects.filter(
            (project) => !this.inaccessibleProjects.includes(project),
        );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getUserAccessibleProjects(_userId: number): Promise<ProjectAccess> {
        return ALL_PROJECT_ACCESS;
    }

    async hasAccessToProject(
        _userId: number,
        projectId: string,
    ): Promise<boolean> {
        return !this.inaccessibleProjects.includes(projectId);
    }
}
