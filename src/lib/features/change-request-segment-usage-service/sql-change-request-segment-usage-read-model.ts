import type { Db } from '../../db/db.js';
import type {
    ChangeRequestStrategy,
    IChangeRequestSegmentUsageReadModel,
} from './change-request-segment-usage-read-model.js';

export class ChangeRequestSegmentUsageReadModel
    implements IChangeRequestSegmentUsageReadModel
{
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    public async getStrategiesUsedInActiveChangeRequests(
        segmentId: number,
    ): Promise<ChangeRequestStrategy[]> {
        const query = this.db.raw(
            `SELECT events.*, cr.project, cr.environment, cr.title
             FROM change_request_events events
             JOIN change_requests cr ON events.change_request_id = cr.id
             WHERE cr.state NOT IN ('Applied', 'Cancelled', 'Rejected')
             AND events.action IN ('updateStrategy', 'addStrategy');`,
        );

        const queryResult = await query;
        const strategies = queryResult.rows
            .filter((row) => row.payload?.segments?.includes(segmentId))
            .map((row) => {
                const { payload, project, environment, feature } = row;
                return {
                    projectId: project,
                    featureName: feature,
                    environment: environment,
                    strategyName: payload.name,
                    ...(payload.id ? { id: payload.id } : {}),
                    changeRequest: {
                        id: row.change_request_id,
                        title: row.title || null,
                    },
                };
            });

        return strategies;
    }
}
