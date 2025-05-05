import type { Db } from '../../types/index.js';
import { ChangeRequestSegmentUsageReadModel } from './sql-change-request-segment-usage-read-model.js';
import { FakeChangeRequestSegmentUsageReadModel } from './fake-change-request-segment-usage-read-model.js';
import type { IChangeRequestSegmentUsageReadModel } from './change-request-segment-usage-read-model.js';

export const createChangeRequestSegmentUsageReadModel = (
    db: Db,
): IChangeRequestSegmentUsageReadModel => {
    return new ChangeRequestSegmentUsageReadModel(db);
};

export const createFakeChangeRequestSegmentUsageReadModel =
    (): IChangeRequestSegmentUsageReadModel => {
        return new FakeChangeRequestSegmentUsageReadModel();
    };
