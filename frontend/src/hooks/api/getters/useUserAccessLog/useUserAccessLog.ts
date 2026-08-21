import { createPaginatedHook } from '../usePaginatedData/usePaginatedData.js';

export const DEFAULT_PAGE_LIMIT = 25;

export interface IUserAccessLogUser {
    id: number;
    name?: string;
    username?: string;
    email?: string;
    imageUrl?: string;
    rootRole?: number;
}

export interface IUserAccessLogPerformer {
    id?: number;
    name?: string;
    imageUrl?: string;
}

export interface IUserAccessLogEntry {
    user: IUserAccessLogUser;
    status: 'added' | 'removed';
    createdAt?: string;
    removedAt?: string;
    performedBy?: IUserAccessLogPerformer;
}

export interface IUserAccessLog {
    items: IUserAccessLogEntry[];
    total: number;
}

const useParameterizedUserAccessLog = createPaginatedHook<IUserAccessLog>(
    {
        items: [],
        total: 0,
    },
    'api/admin/users/access-log?',
);

export const useUserAccessLog = (params: Record<string, any>) =>
    useParameterizedUserAccessLog(params);
