import type { ProjectAccess } from '../private-project/privateProjectStore.js';

export type UserRecentFlagsQuery = {
    limit: number;
    offset: number;
    projectAccess: ProjectAccess;
};

export type UserRecentFlag = {
    name: string;
    userLastUpdatedAt: Date;
};

export interface IUserRecentFlagsReadModel {
    getUserRecentFlags(
        userId: number,
        query: UserRecentFlagsQuery,
    ): Promise<UserRecentFlag[]>;
}
