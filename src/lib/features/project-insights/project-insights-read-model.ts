import type {
    ChangeRequestCounts,
    IProjectInsightsReadModel,
} from './project-insights-read-model-type';
import type { Db } from '../../db/db';

export type ChangeRequestDBState =
    | 'Draft'
    | 'Cancelled'
    | 'Approved'
    | 'In review'
    | 'Applied'
    | 'Scheduled'
    | 'Rejected';

export class ProjectInsightsReadModel implements IProjectInsightsReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getChangeRequests(projectId: string): Promise<ChangeRequestCounts> {
        const changeRequestCounts: ChangeRequestCounts = {
            total: 0,
            approved: 0,
            applied: 0,
            rejected: 0,
            reviewRequired: 0,
            scheduled: 0,
        };

        const rows: Array<{ state: ChangeRequestDBState; count: string }> =
            await this.db('change_requests')
                .select('state')
                .count('* as count')
                .where('project', '=', projectId)
                .groupBy('state');

        return rows.reduce((acc, current) => {
            if (current.state === 'Applied') {
                acc.applied = Number(current.count);
                acc.total += Number(current.count);
            } else if (current.state === 'Approved') {
                acc.approved = Number(current.count);
                acc.total += Number(current.count);
            } else if (current.state === 'Rejected') {
                acc.rejected = Number(current.count);
                acc.total += Number(current.count);
            } else if (current.state === 'In review') {
                acc.reviewRequired = Number(current.count);
                acc.total += Number(current.count);
            } else if (current.state === 'Scheduled') {
                acc.scheduled = Number(current.count);
                acc.total += Number(current.count);
            }

            return acc;
        }, changeRequestCounts);
    }
}
