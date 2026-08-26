import type { GetUsersAccessLogParams, UserAccessLogSchema } from 'openapi';
import { createPaginatedHook } from '../usePaginatedData/usePaginatedData.js';

export const DEFAULT_PAGE_LIMIT = 25;

const useParameterizedUserAccessLog = createPaginatedHook<UserAccessLogSchema>(
    {
        items: [],
        total: 0,
    },
    'api/admin/users/access-log?',
);

export const useUserAccessLog = (params: GetUsersAccessLogParams) =>
    useParameterizedUserAccessLog(params, '', { keepPreviousData: true });
