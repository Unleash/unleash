import { IProjectStats } from 'lib/services/project-service';
import { IProjectStatusStore } from 'lib/types/stores/project-status-store-type';
/* eslint-disable @typescript-eslint/no-unused-vars */

export default class FakeProjectStatusStore implements IProjectStatusStore {
    updateStatus(projectId: string, status: IProjectStats): Promise<void> {
        throw new Error('not implemented');
    }
}
