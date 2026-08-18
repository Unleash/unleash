export type UserAccessLogSortBy = 'createdAt' | 'removedAt' | 'name' | 'status';

export interface IUserAccessLogParams {
    offset: number;
    limit: number;
    sortBy: UserAccessLogSortBy;
    sortOrder: 'asc' | 'desc';
}

/**
 * A raw row as returned by the read model. Role names are NOT resolved here;
 * the service enriches the rows with the current/at-removal role name.
 */
export interface IUserAccessLogRow {
    userId: number;
    name: string | null;
    username: string | null;
    email: string | null;
    imageUrl: string | null;
    removed: boolean;
    createdAt: Date | null;
    removedAt: Date | null;
    deletedRoleId: number | null;
    performedById: number | null;
    performedByName: string | null;
    performedByImageUrl: string | null;
}

export interface IUserAccessLogResult {
    rows: IUserAccessLogRow[];
    total: number;
}

export interface IUserAccessLogReadModel {
    getAccessLog(params: IUserAccessLogParams): Promise<IUserAccessLogResult>;
}
