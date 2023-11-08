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
            `SELECT event.*
             FROM change_request_events event
             JOIN change_requests cr ON event.change_request_id = cr.id
             WHERE cr.state IN ('Draft', 'In Review', 'Scheduled', 'Approved')
             AND event.action IN ('updateStrategy', 'addStrategy');`,
        );

        const isUsed = result.rows.some((row) =>
            row.payload?.segments?.includes(segmentId),
        );

        return isUsed;
    }
}
