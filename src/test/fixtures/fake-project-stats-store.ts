import type { IProjectStats } from '../../lib/features/project/project-service.js';
import type {
    ICreateEnabledDates,
    IProjectStatsStore,
} from '../../lib/types/stores/project-stats-store-type.js';
import type { DoraFeaturesSchema } from '../../lib/openapi/index.js';
/* eslint-disable @typescript-eslint/no-unused-vars */

export default class FakeProjectStatsStore implements IProjectStatsStore {
    private stats: Record<string, IProjectStats> = {};

    async updateProjectStats(
        projectId: string,
        stats: IProjectStats,
    ): Promise<void> {
        this.stats[projectId] = stats;
    }

    async getProjectStats(projectId: string): Promise<IProjectStats> {
        return this.stats[projectId];
    }

    async getTimeToProdDates(): Promise<ICreateEnabledDates[]> {
        return [];
    }

    async getTimeToProdDatesForFeatureToggles(): Promise<DoraFeaturesSchema[]> {
        return [];
    }
}
