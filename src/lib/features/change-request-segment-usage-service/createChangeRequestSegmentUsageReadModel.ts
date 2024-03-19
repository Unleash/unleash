import type { Db } from '../../server-impl';
import { ChangeRequestSegmentUsageReadModel } from './sql-change-request-segment-usage-read-model';
import { FakeChangeRequestSegmentUsageReadModel } from './fake-change-request-segment-usage-read-model';
import type { IChangeRequestSegmentUsageReadModel } from './change-request-segment-usage-read-model';

export const createChangeRequestSegmentUsageReadModel = (
    db: Db,
): IChangeRequestSegmentUsageReadModel => {
    return new ChangeRequestSegmentUsageReadModel(db);
};

export const createFakeChangeRequestSegmentUsageReadModel =
    (): IChangeRequestSegmentUsageReadModel => {
        return new FakeChangeRequestSegmentUsageReadModel();
    };
