export type ChangeRequestCounts = {
    total: number;
    approved: number;
    applied: number;
    rejected: number;
    reviewRequired: number;
    scheduled: number;
};

export interface IProjectInsightsReadModel {
    getChangeRequests(projectId: string): Promise<ChangeRequestCounts>;
}
