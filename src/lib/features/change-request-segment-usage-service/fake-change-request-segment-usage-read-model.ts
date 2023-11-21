import {
    ChangeRequestStrategy,
    IChangeRequestSegmentUsageReadModel,
} from './change-request-segment-usage-read-model';

export class FakeChangeRequestSegmentUsageReadModel
    implements IChangeRequestSegmentUsageReadModel
{
    private isSegmentUsedInActiveChangeRequestsValue: boolean;
    strategiesUsedInActiveChangeRequests: ChangeRequestStrategy[];

    constructor(
        isSegmentUsedInActiveChangeRequests = false,
        strategiesUsedInActiveChangeRequests = [],
    ) {
        this.isSegmentUsedInActiveChangeRequestsValue =
            isSegmentUsedInActiveChangeRequests;

        this.strategiesUsedInActiveChangeRequests =
            strategiesUsedInActiveChangeRequests;
    }

    public async isSegmentUsedInActiveChangeRequests(): Promise<boolean> {
        return this.isSegmentUsedInActiveChangeRequestsValue;
    }

    public async getStrategiesUsedInActiveChangeRequests(): Promise<
        ChangeRequestStrategy[]
    > {
        return this.strategiesUsedInActiveChangeRequests;
    }
}
