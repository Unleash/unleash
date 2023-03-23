import { IChangeRequestAccessReadModel } from './change-request-access-read-model';

export class FakeChangeRequestAccessReadModel
    implements IChangeRequestAccessReadModel
{
    private canBypass: boolean;

    constructor(canBypass: boolean) {
        this.canBypass = canBypass;
    }

    public async canBypassChangeRequest(): Promise<boolean> {
        return this.canBypass;
    }
}
