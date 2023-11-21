import { Db } from '../../db/db';
import {
    ChangeRequestStrategy,
    IChangeRequestSegmentUsageReadModel,
} from './change-request-segment-usage-read-model';

export class ChangeRequestSegmentUsageReadModel
    implements IChangeRequestSegmentUsageReadModel
{
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }
    public async isSegmentUsedInActiveChangeRequests(
        segmentId: number,
    ): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT events.*
             FROM change_request_events events
             JOIN change_requests cr ON events.change_request_id = cr.id
             WHERE cr.state IN ('Draft', 'In review', 'Scheduled', 'Approved')
             AND events.action IN ('updateStrategy', 'addStrategy');`,
        );

        const isUsed = result.rows.some((row) =>
            row.payload?.segments?.includes(segmentId),
        );

        return isUsed;
    }

    public async getStrategiesUsedInActiveChangeRequests(
        segmentId: number,
    ): Promise<ChangeRequestStrategy[]> {
        const query = this.db.raw(
            `SELECT events.*, cr.project, cr.environment
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
                    changeRequestId: row.change_request_id,
                };
            });

        const deduped = strategies.reduce((acc, strategy) => {
            const { changeRequestId, ...rest } = strategy;

            const existingData = acc[strategy.id];

            if (existingData) {
                existingData.changeRequestIds.push(strategy.changeRequestId);
            } else {
                acc[strategy.id] = {
                    ...rest,
                    changeRequestIds: [strategy.changeRequestId],
                };
            }

            return acc;
        }, {});

        return Object.values(deduped);
    }
}
