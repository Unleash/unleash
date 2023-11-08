import { IChangeRequestAccessReadModel } from './change-request-access-read-model';

export class FakeChangeRequestAccessReadModel
    implements IChangeRequestAccessReadModel
{
    private canBypass: boolean;

    private isChangeRequestEnabled: boolean;
    private isSegmentUsedInActiveChangeRequestsValue: boolean;

    constructor(
        canBypass = true,
        isChangeRequestEnabled = true,
        isSegmentUsedInActiveChangeRequests = false,
    ) {
        this.canBypass = canBypass;
        this.isChangeRequestEnabled = isChangeRequestEnabled;
        this.isSegmentUsedInActiveChangeRequestsValue =
            isSegmentUsedInActiveChangeRequests;
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
}
