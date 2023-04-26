import User from '../../types/user';

export interface IChangeRequestAccessReadModel {
    canBypassChangeRequest(
        project: string,
        environment: string,
        user?: User,
    ): Promise<boolean>;
    isChangeRequestsEnabled(
        project: string,
        environment: string,
    ): Promise<boolean>;
    isChangeRequestsEnabledForProject(project: string): Promise<boolean>;
}
