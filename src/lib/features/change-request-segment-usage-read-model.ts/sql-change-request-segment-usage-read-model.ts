import { Db } from '../../db/db';
import { IChangeRequestSegmentUsageReadModel } from './change-request-segment-usage-read-model';

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
            `SELECT *
            FROM change_request_events
            WHERE change_request_id IN (
            SELECT id
            FROM change_requests
            WHERE state IN ('Draft', 'In Review', 'Scheduled', 'Approved')
            )
            AND action IN ('updateStrategy', 'addStrategy');`,
        );

        const isUsed = result.rows.some((row) =>
            row.payload?.segments?.includes(segmentId),
        );

        return isUsed;
    }
}
