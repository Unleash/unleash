import { IPrivateProjectChecker } from './privateProjectCheckerType';
import { Promise } from 'ts-toolbelt/out/Any/Promise';

export class FakePrivateProjectChecker implements IPrivateProjectChecker {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getUserAccessibleProjects(userId: number): Promise<string[]> {
        throw new Error('Method not implemented.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hasAccessToProject(userId: number, projectId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}
