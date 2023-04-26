import { IChangeRequestAccessReadModel } from './change-request-access-read-model';

export class FakeChangeRequestAccessReadModel
    implements IChangeRequestAccessReadModel
{
    private canBypass: boolean;

    private isChangeRequestEnabled: boolean;

    constructor(canBypass = true, isChangeRequestEnabled = true) {
        this.canBypass = canBypass;
        this.isChangeRequestEnabled = isChangeRequestEnabled;
    }

    public async canBypassChangeRequest(): Promise<boolean> {
        return this.canBypass;
    }

    public async isChangeRequestsEnabled(): Promise<boolean> {
        return this.isChangeRequestEnabled;
    }

    public async isChangeRequestsEnabledForProject(): Promise<boolean> {
        return this.isChangeRequestEnabled;
    }
}
