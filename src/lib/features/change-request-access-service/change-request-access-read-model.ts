import { IUser } from '../../types/user';

export interface IChangeRequestAccessReadModel {
    canBypassChangeRequest(
        project: string,
        environment: string,
        user?: IUser,
    ): Promise<boolean>;
    canBypassChangeRequestForProject(
        project: string,
        user?: IUser,
    ): Promise<boolean>;
    isChangeRequestsEnabled(
        project: string,
        environment: string,
    ): Promise<boolean>;
    isChangeRequestsEnabledForProject(project: string): Promise<boolean>;
}
