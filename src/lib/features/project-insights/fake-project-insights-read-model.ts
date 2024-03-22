import type {
    ChangeRequestCounts,
    IProjectInsightsReadModel,
} from './project-insights-read-model-type';

const changeRequestCounts: ChangeRequestCounts = {
    total: 0,
    approved: 0,
    applied: 0,
    rejected: 0,
    reviewRequired: 0,
    scheduled: 0,
};

export class FakeProjectInsightsReadModel implements IProjectInsightsReadModel {
    private counts: Record<string, ChangeRequestCounts> = {};

    async getChangeRequests(projectId: string): Promise<ChangeRequestCounts> {
        return this.counts[projectId] ?? changeRequestCounts;
    }

    async setChangeRequests(projectId: string, counts: ChangeRequestCounts) {
        this.counts[projectId] = counts;
    }
}
