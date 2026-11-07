import type { ProjectAccess } from '../private-project/privateProjectStore.js';

export type UserRecentFlagNamesQuery = {
    limit: number;
    offset: number;
    projectAccess: ProjectAccess;
};

export interface IUserRecentFlagsReadModel {
    getUserRecentFlagNames(
        userId: number,
        query: UserRecentFlagNamesQuery,
    ): Promise<string[]>;
}
