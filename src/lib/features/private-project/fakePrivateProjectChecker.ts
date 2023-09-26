import { IPrivateProjectChecker } from './privateProjectCheckerType';
import { Promise } from 'ts-toolbelt/out/Any/Promise';
import { ProjectAccess } from './privateProjectStore';

export class FakePrivateProjectChecker implements IPrivateProjectChecker {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getUserAccessibleProjects(userId: number): Promise<ProjectAccess> {
        throw new Error('Method not implemented.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hasAccessToProject(userId: number, projectId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}
