import type { IPrivateProjectChecker } from './privateProjectCheckerType.js';
import {
    ALL_PROJECT_ACCESS,
    type ProjectAccess,
} from './privateProjectStore.js';

export class FakePrivateProjectChecker implements IPrivateProjectChecker {
    private projectAccess: ProjectAccess;

    constructor(projectAccess: ProjectAccess = ALL_PROJECT_ACCESS) {
        this.projectAccess = projectAccess;
    }

    async getUserAccessibleProjects(_userId: number): Promise<ProjectAccess> {
        return this.projectAccess;
    }

    async filterUserAccessibleProjects(
        _userId: number,
        projects: string[],
    ): Promise<string[]> {
        return projects.filter((project) => this.canAccess(project));
    }

    async hasAccessToProject(
        _userId: number,
        projectId: string,
    ): Promise<boolean> {
        return this.canAccess(projectId);
    }

    private canAccess(projectId: string): boolean {
        return (
            this.projectAccess.mode === 'all' ||
            this.projectAccess.projects.includes(projectId)
        );
    }
}
