import type {
    ChangeRequestStrategy,
    IChangeRequestSegmentUsageReadModel,
} from './change-request-segment-usage-read-model.js';

export class FakeChangeRequestSegmentUsageReadModel
    implements IChangeRequestSegmentUsageReadModel
{
    strategiesUsedInActiveChangeRequests: ChangeRequestStrategy[];

    constructor(strategiesUsedInActiveChangeRequests = []) {
        this.strategiesUsedInActiveChangeRequests =
            strategiesUsedInActiveChangeRequests;
    }

    public async getStrategiesUsedInActiveChangeRequests(): Promise<
        ChangeRequestStrategy[]
    > {
        return this.strategiesUsedInActiveChangeRequests;
    }
}
