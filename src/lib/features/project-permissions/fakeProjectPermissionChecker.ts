import { IProjectPermissionChecker } from './projectPermissionCheckerType';

export class FakeProjectPermissionChecker implements IProjectPermissionChecker {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getUserAccessibleProjects(userId: number): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
}
