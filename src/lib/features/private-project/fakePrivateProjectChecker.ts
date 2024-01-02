import { IPrivateProjectChecker } from './privateProjectCheckerType';
import { ALL_PROJECT_ACCESS, ProjectAccess } from './privateProjectStore';

export class FakePrivateProjectChecker implements IPrivateProjectChecker {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getUserAccessibleProjects(userId: number): Promise<ProjectAccess> {
        return ALL_PROJECT_ACCESS;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hasAccessToProject(userId: number, projectId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}
