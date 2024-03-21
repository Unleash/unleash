import type {
    ChangeRequestCounts,
    IProjectInsightsReadModel,
} from './project-insights-read-model-type';

const changeRequestCounts: ChangeRequestCounts = {
    total: 0,
    approved: 0,
    applied: 0,
    rejected: 0,
    reviewRequired: 10,
    scheduled: 0,
};

export class FakeProjectInsightsReadModel implements IProjectInsightsReadModel {
    async getChangeRequests(projectId: string): Promise<ChangeRequestCounts> {
        return changeRequestCounts;
    }
}
