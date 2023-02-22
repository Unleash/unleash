import { IProjectStats } from 'lib/services/project-service';
import { IProjectStatsStore } from 'lib/types/stores/project-stats-store-type';
/* eslint-disable @typescript-eslint/no-unused-vars */

export default class FakeProjectStatsStore implements IProjectStatsStore {
    updateProjectStats(
        projectId: string,
        status: IProjectStats,
    ): Promise<void> {
        throw new Error('not implemented');
    }

    getProjectStats(projectId: string): Promise<IProjectStats> {
        throw new Error('not implemented');
    }
}
