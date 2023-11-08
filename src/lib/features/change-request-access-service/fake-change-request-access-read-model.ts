import { IChangeRequestAccessReadModel } from './change-request-access-read-model';

export class FakeChangeRequestAccessReadModel
    implements IChangeRequestAccessReadModel
{
    private canBypass: boolean;

    private isChangeRequestEnabled: boolean;
    private isSegmentUsedInActiveChangeRequestsFn: (id: number) => boolean;

    constructor(
        canBypass = true,
        isChangeRequestEnabled = true,
        isSegmentUsedInActiveChangeRequestsFn = (_: number) => true,
    ) {
        this.canBypass = canBypass;
        this.isChangeRequestEnabled = isChangeRequestEnabled;
        this.isSegmentUsedInActiveChangeRequestsFn =
            isSegmentUsedInActiveChangeRequestsFn;
    }

    public async canBypassChangeRequest(): Promise<boolean> {
        return this.canBypass;
    }

    public async canBypassChangeRequestForProject(): Promise<boolean> {
        return this.canBypass;
    }

    public async isChangeRequestsEnabled(): Promise<boolean> {
        return this.isChangeRequestEnabled;
    }

    public async isChangeRequestsEnabledForProject(): Promise<boolean> {
        return this.isChangeRequestEnabled;
    }

    public async isSegmentUsedInActiveChangeRequests(
        segmentId: number,
    ): Promise<boolean> {
        return this.isSegmentUsedInActiveChangeRequestsFn(segmentId);
    }
}
