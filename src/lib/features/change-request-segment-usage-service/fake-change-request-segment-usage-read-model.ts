import { IChangeRequestSegmentUsageReadModel } from './change-request-segment-usage-read-model';

export class FakeChangeRequestSegmentUsageReadModel
    implements IChangeRequestSegmentUsageReadModel
{
    private isSegmentUsedInActiveChangeRequestsValue: boolean;

    constructor(isSegmentUsedInActiveChangeRequests = false) {
        this.isSegmentUsedInActiveChangeRequestsValue =
            isSegmentUsedInActiveChangeRequests;
    }

    public async isSegmentUsedInActiveChangeRequests(): Promise<boolean> {
        return this.isSegmentUsedInActiveChangeRequestsValue;
    }
}
