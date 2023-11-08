import { Db } from 'lib/server-impl';
import { ChangeRequestSegmentUsageReadModel } from './sql-change-request-segment-usage-read-model';
import { FakeChangeRequestSegmentUsageReadModel } from './fake-change-request-segment-usage-read-model';
import { IChangeRequestSegmentUsageReadModel } from './change-request-segment-usage-read-model';

export const createChangeRequestSegmentUsageModel = (
    db: Db,
): IChangeRequestSegmentUsageReadModel => {
    return new ChangeRequestSegmentUsageReadModel(db);
};

export const createFakeChangeRequestAccessService =
    (): IChangeRequestSegmentUsageReadModel => {
        return new FakeChangeRequestSegmentUsageReadModel();
    };
