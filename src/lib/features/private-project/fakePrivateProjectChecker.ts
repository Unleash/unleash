import { IPrivateProjectChecker } from './privateProjectCheckerType';

export class FakeprivateProjectChecker implements IPrivateProjectChecker {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getUserAccessibleProjects(userId: number): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
}
